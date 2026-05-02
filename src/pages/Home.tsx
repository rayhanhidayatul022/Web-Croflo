import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import Header from '../components/Header'
import NavBar from '../components/NavBar'
import { db, auth } from '../services/firebase'
import { onAuthStateChanged } from 'firebase/auth'

type Place = {
  id: string
  name: string
  category?: string
  image?: string
  rating?: number
  coordinates?: unknown
}

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

function parseCoords(value: unknown): { lat: number; lng: number } | null {
  if (typeof value === 'string') {
    const parts = value.split(',').map((p) => parseFloat(p.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] }
    }
  }
  if (Array.isArray(value) && value.length === 2) {
    const lat = parseFloat(value[0])
    const lng = parseFloat(value[1])
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
  }
  if (typeof value === 'object' && value !== null) {
    const lat = parseFloat((value as any).latitude || (value as any).lat)
    const lng = parseFloat((value as any).longitude || (value as any).lng)
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
  }
  return null
}

export default function Home() {
  const navigate = useNavigate()
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState('User')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            setUserName(docSnap.data().username || user.displayName || 'User')
          } else {
            setUserName(user.displayName || 'User')
          }
        } catch(err) {
          console.error(err)
        }
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadPlaces = async () => {
      setLoading(true)
      setError(null)
      try {
        const snap = await getDocs(collection(db, 'places'))
        const items = snap.docs.map((docSnap) => {
          const data = docSnap.data() as Record<string, unknown>
          return {
            id: docSnap.id,
            name: (data.name as string) ?? 'Untitled Place',
            category: data.category as string | undefined,
            image: data.image as string | undefined,
            rating: typeof data.rating === 'number' ? data.rating : undefined,
            coordinates: data.coordinates
          }
        })

        items.sort((a, b) => a.id.localeCompare(b.id))
        if (!cancelled) setPlaces(items)
      } catch (err: unknown) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load places')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPlaces()
    return () => {
      cancelled = true
    }
  }, [])

  const openPlace = (place: Place) => {
    navigate(`/place/${place.id}`, { state: { place } })
  }

  const featuredPlace = useMemo(() => places[0], [places])
  const topPlaces = useMemo(() => {
    return [...places].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 2)
  }, [places])

  return (
    <div className="min-h-screen bg-background text-on-background">
      <Header />
      <NavBar />

      <main className="lg:ml-64 pt-20 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Greeting */}
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-primary-container tracking-tight">Good Morning, {userName}</h1>
            <p className="text-secondary font-medium mt-1">Ready to find your perfect workspace today?</p>
          </header>

          {/* Grid Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Large Feature Card: Current Spot (placeholder) */}
            <section className="col-span-12 lg:col-span-8">
              <div className="relative bg-white rounded-lg overflow-hidden shadow-lg border border-blue-50 h-[420px] group">
                <img
                  alt={featuredPlace?.name ?? 'Featured place'}
                  className="absolute inset-0 w-full h-full object-cover"
                  src={featuredPlace?.image ?? 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1400&auto=format&fit=crop'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-container/90 via-primary-container/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      <span className="text-sky-tint text-sm font-bold uppercase tracking-widest">Live Now</span>
                    </div>
                    <h3 className="text-white text-3xl font-extrabold mb-1">{featuredPlace?.name ?? 'Loading places...'}</h3>
                    <p className="text-blue-100/80 font-medium">{formatCoordinates(featuredPlace?.coordinates)}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 text-center min-w-[140px]">
                    <span className="block text-4xl font-black text-white leading-none">{featuredPlace?.rating ?? '—'}</span>
                    <span className="text-[10px] text-blue-100 uppercase tracking-widest font-bold mt-2 block">Rating</span>
                  </div>
                </div>
                <div className="absolute top-6 left-6">
                  <span className="bg-white/90 backdrop-blur-sm text-primary-container px-4 py-2 rounded-full text-xs font-bold shadow-sm">Featured Place</span>
                </div>
              </div>
            </section>

            {/* Hotspots Mini Map */}
            <section className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-lg p-6 shadow-lg border border-blue-50 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-primary-container">Crowd Hotspots</h3>
                  <Link to="/map" className="text-pacific-blue text-xs font-bold cursor-pointer hover:underline">View Map</Link>
                </div>
                <div className="relative flex-1 rounded-lg overflow-hidden border border-blue-50 bg-slate-100 min-h-[200px] z-0">
                  {places.length > 0 ? (
                    <MapContainer
                      center={[-6.914744, 107.60981]}
                      zoom={12}
                      style={{ width: '100%', height: '100%' }}
                      zoomControl={false}
                      dragging={false}
                      scrollWheelZoom={false}
                      doubleClickZoom={false}
                    >
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                      />
                      {topPlaces.map((p, i) => {
                        const pos = parseCoords(p.coordinates)
                        if (!pos) return null
                        const color = i === 0 ? '#ef4444' : '#f97316' // red for highest, orange for second
                        return (
                          <Circle
                            key={p.id}
                            center={[pos.lat, pos.lng]}
                            radius={450}
                            pathOptions={{ fillColor: color, color: color, fillOpacity: 0.5, stroke: false }}
                          />
                        )
                      })}
                    </MapContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">Loading Map...</div>
                  )}
                </div>
                <div className="mt-6 space-y-4">
                  {topPlaces.map((place, idx) => (
                    <div key={place.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-error' : 'bg-orange-500'}`}></div>
                        <span className="text-sm font-semibold text-on-surface line-clamp-1">{place.name}</span>
                      </div>
                      <span className={`text-xs font-bold ${idx === 0 ? 'text-error' : 'text-orange-500'}`}>
                        {idx === 0 ? 'High' : 'Medium'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Recommended For You Section */}
            <section className="col-span-12 mt-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-primary-container tracking-tight">Recommended for You</h3>
                <span className="text-pacific-blue font-bold text-sm">{places.length} places</span>
              </div>
              {loading && <p className="text-sm text-slate-500">Loading places...</p>}
              {error && <p className="text-sm text-red-500">Failed loading places: {error}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {places.map((place) => (
                  <div
                    key={place.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openPlace(place)}
                    onKeyDown={(e) => e.key === 'Enter' && openPlace(place)}
                    className="bg-white rounded-lg p-4 shadow-lg border border-blue-50 flex items-center gap-5 hover:border-pacific-blue transition-all group cursor-pointer"
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                      <img
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        src={place.image ?? 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop'}
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-ocean-teal uppercase tracking-widest mb-1 block">{place.category ?? 'Place'}</span>
                      <h4 className="text-lg font-bold text-primary-container">{place.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="material-symbols-outlined text-xs text-slate-400">location_on</span>
                        <span className="text-xs font-semibold text-slate-500">{formatCoordinates(place.coordinates)}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-amber-500">star</span>
                        <span className="text-xs font-semibold text-slate-500">{place.rating ?? '—'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      {/* Contextual FAB */}
      <button className="fixed bottom-8 right-8 bg-primary-container text-on-primary w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  )
}
