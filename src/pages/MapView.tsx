import React, { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, query, limit, getDocs } from 'firebase/firestore'
import { db } from '../services/firebase'
import Header from '../components/Header'
import NavBar from '../components/NavBar'
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const getDensityLevel = (id: string) => {
  const sum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const val = sum % 3
  return val === 0 ? 'low' : val === 1 ? 'moderate' : 'high'
}

const getDensityColor = (level: string) => {
  if (level === 'low') return '#22c55e' // green-500
  if (level === 'moderate') return '#eab308' // yellow-500
  return '#ef4444' // red-500
}

const customMarkerIcon = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="w-full h-full bg-[#0F2046] text-white rounded-full flex items-center justify-center shadow-xl border-[3px] border-white hover:scale-110 transition-transform cursor-pointer">
           <span class="material-symbols-outlined text-[20px]">location_on</span>
         </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
})

type Place = {
  id: string
  name: string
  address?: string
  coordinates?: any
  image?: string
  category?: string
  rating?: number
}

function parseCoordinates(value: any): { lat: number; lng: number } | null {
  if (!value) return null
  if (Array.isArray(value) && value.length >= 2) return { lat: Number(value[0]), lng: Number(value[1]) }
  if (typeof value === 'string') {
    const parts = value.split(',').map((p) => p.trim())
    if (parts.length >= 2) return { lat: Number(parts[0]), lng: Number(parts[1]) }
  }
  if (typeof value === 'object') {
    if ('latitude' in value && 'longitude' in value) return { lat: Number(value.latitude), lng: Number(value.longitude) }
    if ('lat' in value && 'lng' in value) return { lat: Number(value.lat), lng: Number(value.lng) }
  }
  return null
}

export default function MapView() {
  const [places, setPlaces] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)
  const [heatmapActive, setHeatmapActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)
  const navigate = useNavigate()


  useEffect(() => {
    let mounted = true

    const fetchSpecificPlaces = async () => {
      const placeIds = ['place_001', 'place_002', 'place_003', 'place_004', 'place_005']
      const fetched: Place[] = []
      
      try {
        for (const id of placeIds) {
          const snap = await getDoc(doc(db, 'places', id))
          if (snap.exists()) {
            fetched.push({ id: snap.id, ...snap.data() } as Place)
          }
        }
        if (fetched.length === 0) {
          const q = query(collection(db, 'places'), limit(5))
          const snap = await getDocs(q)
          snap.forEach(docSnap => fetched.push({ id: docSnap.id, ...docSnap.data() } as Place))
        }
      } catch (err) {
        console.error('Error fetching places:', err)
      }
      
      if (mounted) {
        setPlaces(fetched)
        setLoading(false)
      }
    }

    fetchSpecificPlaces()
    return () => { mounted = false }
  }, [])

  const handleSeeDetails = () => {
    if (selectedPlace) {
      navigate('/place/' + selectedPlace.id, { state: { place: selectedPlace } })
    }
  }

  const filteredPlaces = useMemo(() => {
    if (!searchQuery.trim()) return places
    return places.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.address && p.address.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [places, searchQuery])

  const mapCenter = { lat: -6.914744, lng: 107.60981 }

  if (loading) return <div className="flex h-screen items-center justify-center">Loading Map...</div>

  // Calculations for dynamic side panel
  const occupancyCount = selectedPlace?.rating ?? 0
  const waitTime = occupancyCount >= 30 ? '12m' : occupancyCount >= 15 ? '8m' : '5m'
  const densityPercent = occupancyCount >= 30 ? '84%' : occupancyCount >= 15 ? '72%' : '58%'
  const trendLabel = occupancyCount >= 30 ? 'High' : occupancyCount >= 15 ? 'Moderate' : 'Low'
  const trendIcon = occupancyCount >= 30 ? 'trending_up' : occupancyCount >= 15 ? 'trending_flat' : 'trending_down'
  const trendColor = occupancyCount >= 30 ? 'text-red-500' : occupancyCount >= 15 ? 'text-yellow-500' : 'text-blue-400'
  const densityStatus = occupancyCount >= 30 ? 'High Crowd Density' : occupancyCount >= 15 ? 'Moderate Crowd Density' : 'Low Crowd Density'
  const densityStatusBg = occupancyCount >= 30 ? 'bg-red-500' : occupancyCount >= 15 ? 'bg-yellow-500' : 'bg-green-500'

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-on-background selection:bg-secondary-container">
      <Header />
      <NavBar />
      
      <main className="absolute inset-0 top-16 lg:left-64 bg-surface-container-low">
        <div className="absolute inset-0 z-0">
          <MapContainer
            ref={setMapInstance}
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={14}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {filteredPlaces.map((p) => {
              const pos = parseCoordinates(p.coordinates)
              if (!pos) return null
              const densityLevel = getDensityLevel(p.id)
              const densityColor = getDensityColor(densityLevel)
              return (
                <React.Fragment key={p.id}>
                  {heatmapActive && (
                    <Circle
                      center={[pos.lat, pos.lng]}
                      radius={350}
                      pathOptions={{ fillColor: densityColor, color: densityColor, fillOpacity: 0.35, stroke: false }}
                    />
                  )}
                  <Marker
                    position={[pos.lat, pos.lng]}
                    eventHandlers={{ click: () => setSelectedPlace(p) }}
                    icon={customMarkerIcon}
                  />
                </React.Fragment>
              )
            })}
          </MapContainer>
        </div>

        <div className="absolute top-6 left-8 right-8 flex justify-between items-start pointer-events-none z-10">
          <div className="flex gap-4 pointer-events-auto">
            <div className="bg-white/90 backdrop-blur shadow-xl rounded-full px-6 py-3 flex items-center gap-4 border border-blue-50 w-80 md:w-96">
              <span className="material-symbols-outlined text-slate-400">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-slate-400 outline-none" 
                placeholder="Search places, landmarks..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur shadow-xl rounded-2xl p-2 border border-blue-50 pointer-events-auto flex flex-col gap-2">
            <button onClick={() => setHeatmapActive(!heatmapActive)} className={`p-2 rounded-xl transition-colors ${heatmapActive ? 'bg-blue-50 text-blue-700' : 'text-slate-400 hover:text-slate-600'}`}><span className="material-symbols-outlined">layers</span></button>
            <button onClick={() => mapInstance?.setView([-6.914744, 107.60981], 14)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"><span className="material-symbols-outlined">my_location</span></button>
            <div className="h-px bg-slate-100 mx-2"></div>
            <button onClick={() => mapInstance?.zoomIn()} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"><span className="material-symbols-outlined">add</span></button>
            <button onClick={() => mapInstance?.zoomOut()} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"><span className="material-symbols-outlined">remove</span></button>
          </div>
        </div>

        {selectedPlace && (
          <div className="absolute right-8 top-6 w-full max-w-[340px] hidden md:block z-20 transition-all max-h-[calc(100vh-8rem)]">
            <div className="bg-white/95 backdrop-blur-xl h-auto rounded-3xl shadow-2xl border border-white/50 flex flex-col overflow-hidden">
              <div className="h-36 relative shrink-0">
                <img 
                  className="w-full h-full object-cover" 
                  src={selectedPlace.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800'} 
                  alt={selectedPlace.name} 
                />
                <div className="absolute top-4 right-4 bg-white/30 backdrop-blur-md p-1.5 rounded-full cursor-pointer hover:bg-white/50 transition-colors" onClick={() => setSelectedPlace(null)}>
                  <span className="material-symbols-outlined text-white text-sm">close</span>
                </div>
                <div className={`absolute bottom-4 left-6 ${densityStatusBg} text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg`}>
                  {densityStatus}
                </div>
              </div>

              <div className="p-6 pb-2 flex-1 overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-[#0F2046] leading-tight tracking-tight">{selectedPlace.name}</h2>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="material-symbols-outlined text-xs text-blue-600">location_on</span>
                      <p className="text-slate-500 font-medium text-[10px] line-clamp-1">{selectedPlace.address || 'Jl. Asia Afrika No.65, Bandung'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-slate-50 p-2 rounded-xl flex flex-col items-center border border-slate-100">
                    <span className="material-symbols-outlined text-blue-600 text-[16px] mb-1">groups</span>
                    <span className="text-xs font-black text-[#0F2046]">{densityPercent}</span>
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Capacity</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl flex flex-col items-center border border-green-100 ring-1 ring-green-100/50">
                    <span className="material-symbols-outlined text-green-500 text-[16px] mb-1">timer</span>
                    <span className="text-xs font-black text-[#0F2046]">{waitTime}</span>
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Wait Time</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl flex flex-col items-center border border-slate-100">
                    <span className={`material-symbols-outlined ${trendColor} text-[16px] mb-1`}>{trendIcon}</span>
                    <span className="text-xs font-black text-[#0F2046]">{trendLabel}</span>
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">Trend</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-end mb-3">
                    <h3 className="text-[9px] font-black text-[#0F2046] uppercase tracking-widest">Crowd Prediction</h3>
                  </div>
                  <div className="relative h-16 w-full flex items-end justify-between px-1">
                    {[40, 55, 30, 45, 65].map((h, i) => (
                      <div 
                        key={i} 
                        className={"w-6 rounded-t-md transition-all " + (i === 2 ? 'bg-[#0F2046] shadow-md' : 'bg-blue-100')} 
                        style={{ height: h + '%' }}
                      >
                        {i === 2 && <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-black text-[#0F2046]">Now</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-2 shrink-0">
                <button 
                  onClick={handleSeeDetails}
                  className="w-full bg-[#0F2046] text-white py-3.5 rounded-full font-black text-xs shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  <span>SEE LIVE DETAILS</span>
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-xl rounded-2xl px-6 py-4 border border-blue-50 shadow-2xl z-10 flex flex-col gap-3">
          <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Density Intelligence</h4>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-[10px] font-black text-[#0F2046]">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
              <span className="text-[10px] font-black text-[#0F2046]">Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
              <span className="text-[10px] font-black text-[#0F2046]">High</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 md:right-[432px] z-10 transition-all">
          <button 
            onClick={() => setHeatmapActive(!heatmapActive)}
            className={`flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all ${heatmapActive ? 'bg-amber-500 text-white' : 'bg-[#0F2046] text-white'}`}
          >
            <span className="material-symbols-outlined text-sm">waves</span>
            <span className="text-xs font-black tracking-tight">{heatmapActive ? 'Heatmap: ON' : 'Heatmap: OFF'}</span>
          </button>
        </div>
      </main>
    </div>
  )
}
