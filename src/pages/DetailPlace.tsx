import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import Header from '../components/Header'
import NavBar from '../components/NavBar'
import { db } from '../services/firebase'

type Place = {
  id: string
  name: string
  category?: string
  image?: string
  coordinates?: unknown
  rating?: number
}

type LiveMetrics = {
  count?: number
  image_path?: string
}

type HourlyPoint = {
  time: string
  count: number
  timestamp: number
}

const API_BASE = '/api/live'
const HISTORY_KEY_PREFIX = 'croflo:place-history:'
const HOURLY_SAMPLE_MS = 60 * 60 * 1000
const HOURLY_SAMPLE_GRACE_MS = 50 * 60 * 1000

function formatCoordinates(value: unknown) {
  if (!value) return 'Unknown location'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value !== null && 'latitude' in value && 'longitude' in value) {
    const lat = Number((value as { latitude: number }).latitude)
    const lng = Number((value as { longitude: number }).longitude)
    if (Number.isFinite(lat) && Number.isFinite(lng)) return `${lat.toFixed(3)}, ${lng.toFixed(3)}`
  }
  return 'Unknown location'
}

function formatClockLabel(value: Date) {
  const hours = String(value.getHours()).padStart(2, '0')
  return `${hours}:00`
}

function readHistory(placeId: string) {
  if (typeof window === 'undefined') return [] as HourlyPoint[]

  try {
    const raw = window.localStorage.getItem(`${HISTORY_KEY_PREFIX}${placeId}`)
    if (!raw) return []

    const parsed = JSON.parse(raw) as Array<Partial<HourlyPoint>>
    return parsed
      .filter(
        (point) => typeof point?.time === 'string' && typeof point?.count === 'number' && typeof point?.timestamp === 'number'
      )
      .map((point) => ({ time: point.time as string, count: point.count as number, timestamp: point.timestamp as number }))
  } catch {
    return []
  }
}

function writeHistory(placeId: string, history: HourlyPoint[]) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(`${HISTORY_KEY_PREFIX}${placeId}`, JSON.stringify(history.slice(-5)))
  } catch {
    // ignore storage failures
  }
}

function appendHourlyPoint(placeId: string, count: number, previousHistory: HourlyPoint[]) {
  const now = Date.now()
  const nextPoint = { time: formatClockLabel(new Date(now)), count: Math.round(count), timestamp: now }
  const filtered = previousHistory.filter((point) => now - point.timestamp <= 5 * HOURLY_SAMPLE_MS)
  const lastPoint = filtered[filtered.length - 1]

  if (lastPoint && now - lastPoint.timestamp < HOURLY_SAMPLE_GRACE_MS) {
    const nextHistory = [...filtered.slice(0, -1), nextPoint].slice(-5)
    writeHistory(placeId, nextHistory)
    return nextHistory
  }

  const nextHistory = [...filtered, nextPoint].slice(-5)
  writeHistory(placeId, nextHistory)
  return nextHistory
}

function getVenueStatus(count?: number) {
  if (typeof count !== 'number') {
    return { label: 'Live Updates', accent: 'bg-[#69d6e4]', detail: 'Waiting for API metrics' }
  }

  if (count >= 30) {
    return { label: 'High Demand', accent: 'bg-[#0d97a5]', detail: 'Best time for early visits' }
  }

  if (count >= 15) {
    return { label: 'Moderate Flow', accent: 'bg-[#435d97]', detail: 'Comfortable for remote work' }
  }

  return { label: 'Quiet Hours', accent: 'bg-[#b6c5f5]', detail: 'Usually easier to find seats' }
}

function getWaitTime(count?: number) {
  if (typeof count !== 'number') return '8 min'
  if (count >= 30) return '12 min'
  if (count >= 15) return '8 min'
  return '5 min'
}

function getDensity(count?: number) {
  if (typeof count !== 'number') return '72%'
  if (count >= 30) return '84%'
  if (count >= 15) return '72%'
  return '58%'
}

function getChartPeak(points: HourlyPoint[]) {
  return Math.max(5, ...points.map((point) => point.count))
}

export default function DetailPlace() {
  const { id } = useParams()
  const location = useLocation()
  const [place, setPlace] = useState<Place | undefined>((location.state as any)?.place)
  const [liveCount, setLiveCount] = useState<number | undefined>(undefined)
  const [liveImageUrl, setLiveImageUrl] = useState<string>('http://13.213.18.54:8000/video')
  const [hourlyHistory, setHourlyHistory] = useState<HourlyPoint[]>(() => (id ? readHistory(id) : []))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const fetchPlace = async () => {
      setLoading(true)
      setError(null)

      try {
        const ref = doc(db, 'places', id)
        const snap = await getDoc(ref)

        if (!snap.exists()) {
          if (!cancelled) {
            setPlace(undefined)
            setError('Place not found in Firestore')
          }
          return
        }

        if (!cancelled) {
          const data = snap.data() as any
          setPlace({
            id: snap.id,
            name: data.name ?? data.title ?? 'Untitled',
            category: data.category,
            image: data.image,
            coordinates: data.coordinates,
            rating: typeof data.rating === 'number' ? data.rating : undefined,
          })
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? 'Failed to fetch')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPlace()

    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    if (!id) return

    let cancelled = false

    const loadLiveMetrics = async () => {
      try {
        const response = await fetch(`${API_BASE}/latest`, { cache: 'no-store' })
        if (!response.ok) throw new Error(`Live metrics request failed (${response.status})`)

        const data = (await response.json()) as LiveMetrics
        const count = Number(data.count)
        const nextCount = Number.isFinite(count) ? count : 0
        const nextImageUrl = 'http://13.213.18.54:8000/video'

        if (cancelled) return

        setLiveCount(nextCount)
        setLiveImageUrl(nextImageUrl)
        setHourlyHistory((current) => appendHourlyPoint(id, nextCount, current.length > 0 ? current : readHistory(id)))
      } catch {
        if (!cancelled) {
          setLiveCount(undefined)
          setLiveImageUrl('http://13.213.18.54:8000/video')
        }
      }
    }

    loadLiveMetrics()
    const timer = window.setInterval(loadLiveMetrics, HOURLY_SAMPLE_MS)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [id])

  useEffect(() => {
    document.title = `${place?.name ?? 'Place'} | Croflo`
  }, [place?.name])

  const occupancyCount = liveCount ?? place?.rating ?? 0
  const status = getVenueStatus(occupancyCount)
  const waitTime = getWaitTime(occupancyCount)
  const locationLabel = formatCoordinates(place?.coordinates)
  const placeImage = place?.image ?? 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1000&auto=format&fit=crop'
  const chartPoints = useMemo(() => hourlyHistory.slice(-5), [hourlyHistory])
  const chartPeak = getChartPeak(chartPoints)

  return (
    <div className="min-h-screen bg-background text-on-background font-body">
      <Header />
      <NavBar />

      <main className="min-h-screen lg:ml-64 pt-20 pb-12 px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {loading && !place ? (
            <section className="rounded-3xl border border-sky-tint/20 bg-white p-8 shadow-[10px_20px_40px_-15px_rgba(15,32,70,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-on-secondary-container">Loading venue</p>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-primary-container">Fetching place data...</h1>
            </section>
          ) : error && !place ? (
            <section className="rounded-3xl border border-red-200 bg-red-50 p-8">
              <p className="text-sm font-bold text-red-700">{error}</p>
              <p className="mt-2 text-sm text-red-600/80">No data available for this place.</p>
            </section>
          ) : place ? (
            <>
              <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <nav className="flex flex-wrap items-center gap-2 text-xs text-on-primary-container mb-2 font-medium">
                    <span>Places</span>
                    <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                    <span>Bandung</span>
                    <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                    <span className="text-primary-container font-bold">{place.name}</span>
                  </nav>
                  <h1 className="text-4xl font-extrabold text-primary-container tracking-tight">{place.name}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="material-symbols-outlined text-[#0d97a5] text-sm">location_on</span>
                    <span className="text-sm text-on-secondary-container">{locationLabel}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowShareModal(true)}
                  className="bg-primary-container text-on-primary px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary-container/20 hover:scale-105 transition-transform active:scale-95"
                >
                  <span className="material-symbols-outlined">share</span>
                  <span>Share Live Status</span>
                </button>
              </section>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-[10px_20px_40px_-15px_rgba(15,32,70,0.08)] border border-sky-tint/20 flex flex-col justify-between h-40 overflow-hidden relative">
                      <div className="z-10">
                        <p className="text-xs font-bold text-on-primary-container uppercase tracking-widest mb-1">Status</p>
                        <h3 className="text-2xl font-extrabold text-primary-container">{status.label}</h3>
                      </div>
                      <div className="flex items-center gap-2 z-10">
                        <div className={`w-3 h-3 ${status.accent} rounded-full animate-pulse`} />
                        <span className="text-xs font-medium text-on-secondary-container">{status.detail}</span>
                      </div>
                      <div className="absolute -right-4 -bottom-4 opacity-10">
                        <span className="material-symbols-outlined text-8xl text-on-primary-container" style={{ fontVariationSettings: "'wght' 100" }}>
                          groups
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-[10px_20px_40px_-15px_rgba(15,32,70,0.08)] border border-sky-tint/20 flex flex-col justify-between h-40">
                      <div>
                        <p className="text-xs font-bold text-on-primary-container uppercase tracking-widest mb-2">Prediksi Kepadatan</p>
                        <div className="flex flex-col">
                          <h3 className="text-5xl font-black text-primary-container leading-none">{Number.isFinite(occupancyCount) ? Math.round(occupancyCount) : '—'}</h3>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">Orang</span>
                        </div>
                      </div>
                      <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-secondary-container h-full"
                          style={{ width: `${Math.max(8, Math.min(100, Number.isFinite(occupancyCount) ? Math.round(occupancyCount * 3) : 8))}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-primary-container p-6 rounded-lg shadow-[10px_20px_40px_-15px_rgba(15,32,70,0.08)] flex flex-col justify-between h-40 text-white">
                      <div>
                        <p className="text-xs font-bold text-on-primary-container uppercase tracking-widest mb-1">Est. Wait Time</p>
                        <h3 className="text-3xl font-extrabold text-white">{waitTime}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-on-primary-container text-sm">schedule</span>
                        <span className="text-xs font-medium text-on-primary-container">Below average for Friday</span>
                      </div>
                    </div>
                  </div>

                  <section className="bg-white p-1 rounded-xl shadow-[10px_20px_40px_-15px_rgba(15,32,70,0.08)] border border-sky-tint/20 overflow-hidden">
                    <div className="relative aspect-video w-full bg-slate-900 group cursor-pointer rounded-lg overflow-hidden">
                      <img alt={place.name} className="w-full h-full object-cover opacity-80" src={liveImageUrl || placeImage} />
                      
                      {/* Top Overlay */}
                      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
                        <div className="bg-[#B91C1C] text-white px-3.5 py-1.5 rounded-md flex items-center gap-2.5 shadow-sm border border-red-800">
                          <div className="w-2.5 h-2.5 bg-[#fecaca] rounded-full animate-pulse shadow-[0_0_8px_rgba(254,202,202,0.8)]" />
                          <h2 className="font-extrabold text-[12px] tracking-[0.15em] uppercase pt-[1px]">Live Visual Feed</h2>
                        </div>
                        <div className="flex gap-2">
                          <span className="px-3 py-1.5 bg-slate-800/80 backdrop-blur-sm text-[10px] font-bold rounded-md text-slate-200">CAM-01: Main Hall</span>
                        </div>
                      </div>

                      {/* Bottom Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 pointer-events-none">
                        <div className="flex justify-between items-end gap-4 pointer-events-auto">
                          <div className="text-white">
                              <p className="text-lg font-bold">{place.name}</p>
                          </div>
                          <div className="flex gap-4">
                            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40">
                              <span className="material-symbols-outlined">fullscreen</span>
                            </button>
                            <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40">
                              <span className="material-symbols-outlined">settings</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <section className="bg-white p-6 rounded-lg shadow-[10px_20px_40px_-15px_rgba(15,32,70,0.08)] border border-sky-tint/20">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-bold text-primary-container flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#0f2046]">insights</span>
                        Occupancy Forecast
                      </h2>
                    </div>
                    <div className="space-y-4 h-64 flex items-end justify-between gap-3 px-2">
                      {chartPoints.length > 0 ? (
                        chartPoints.map((point, index) => {
                          const heightPercent = Math.max(16, Math.round((point.count / chartPeak) * 100))
                          const isLatest = index === chartPoints.length - 1

                          return (
                            <div key={`${point.time}-${point.count}`} className="flex-1 bg-surface-container rounded-t-full relative min-h-full flex items-end justify-center">
                              <div
                                className={`${isLatest ? 'bg-[#0f2046]' : 'bg-[#b6c5f5]'} rounded-t-full w-full transition-all duration-300`}
                                style={{ height: `${heightPercent}%` }}
                              />
                              {isLatest ? (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0f2046] text-white text-[8px] py-1 px-2 rounded whitespace-nowrap">
                                  Latest
                                </div>
                              ) : null}
                              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-on-primary-container">
                                {point.time}
                              </div>
                              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white bg-[#435d97] px-1.5 py-0.5 rounded">
                                {point.count}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="w-full rounded-2xl border border-dashed border-outline-variant/60 bg-surface-container-low py-12 text-center text-sm text-on-secondary-container">
                          Waiting for hourly samples from the API.
                        </div>
                      )}
                    </div>
                    <p className="mt-10 text-xs text-on-secondary-container leading-relaxed">
                      <span className="font-bold text-primary-container">Insight:</span> Grafik hanya menampilkan 5 jam terakhir dan update per jam.
                    </p>
                  </section>

                  <section className="bg-gradient-to-br from-[#435d97] to-[#0f2046] p-6 rounded-lg text-white shadow-lg overflow-hidden relative">
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Dago Weather</p>
                          <h2 className="text-4xl font-extrabold mt-1">22°C</h2>
                        </div>
                        <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          light_mode
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-6">
                        <span className="font-bold">Partly Sunny</span>
                        <span className="opacity-60">•</span>
                        <span className="text-sm">Humidity: 64%</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 border-t border-white/20 pt-4">
                        <div className="text-center">
                          <p className="text-[10px] font-bold opacity-60">17:00</p>
                          <span className="material-symbols-outlined text-sm my-1">cloud</span>
                          <p className="text-xs font-bold">21°</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold opacity-60">18:00</p>
                          <span className="material-symbols-outlined text-sm my-1">rainy</span>
                          <p className="text-xs font-bold">19°</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold opacity-60">19:00</p>
                          <span className="material-symbols-outlined text-sm my-1">nights_stay</span>
                          <p className="text-xs font-bold">18°</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold opacity-60">20:00</p>
                          <span className="material-symbols-outlined text-sm my-1">nights_stay</span>
                          <p className="text-xs font-bold">17°</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                  </section>

                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>

      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Share Location</h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-sm font-medium text-slate-500 mb-2">Link to share</p>
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <input 
                type="text" 
                readOnly 
                value={window.location.href} 
                className="bg-transparent border-none p-0 text-sm font-medium text-slate-800 w-full focus:ring-0 truncate mr-4 outline-none"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  setLinkCopied(true)
                  setTimeout(() => setLinkCopied(false), 2000)
                }} 
                className={`text-sm font-bold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 ${linkCopied ? 'text-green-600' : 'text-[#0d97a5] hover:text-[#0a7a85]'}`}
              >
                {linkCopied ? (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    COPIED
                  </>
                ) : 'COPY LINK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
