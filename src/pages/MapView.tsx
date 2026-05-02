import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../services/firebase'

type Place = {
  id: string
  name?: string
  coordinates?: any
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

function loadGoogleMaps(apiKey: string) {
  return new Promise<void>((resolve, reject) => {
    if (typeof (window as any).google !== 'undefined' && (window as any).google.maps) return resolve()

    const existing = document.querySelector(`script[data-google-maps]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      return
    }

    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    s.async = true
    s.defer = true
    s.setAttribute('data-google-maps', '1')
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Google Maps script'))
    document.head.appendChild(s)
  })
}

export default function MapView() {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [places, setPlaces] = useState<Place[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) console.warn('VITE_GOOGLE_MAPS_API_KEY not set')

    let mounted = true
    const placeIds = ['place_001', 'place_002', 'place_003', 'place_004', 'place_005']

    const fetchPlaces = async () => {
      const results: Place[] = []
      for (const id of placeIds) {
        try {
          const snap = await getDoc(doc(db, 'places', id))
          if (snap.exists()) results.push({ id: snap.id, ...(snap.data() as any) })
        } catch (err) {
          // ignore individual errors
        }
      }
      if (mounted) setPlaces(results)
    }

    const init = async () => {
      try {
        if (apiKey) await loadGoogleMaps(apiKey)
        await fetchPlaces()
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()
    return () => {
      mounted = false
    }
  }, [])

  // create map and markers when places are available
  useEffect(() => {
    const g = (window as any).google
    if (!g || !mapRef.current) return

    const center = places.length
      ? (() => {
          const first = parseCoordinates(places[0].coordinates)
          return first ?? { lat: -6.914744, lng: 107.60981 }
        })()
      : { lat: -6.914744, lng: 107.60981 }

    const map = new g.maps.Map(mapRef.current, { center, zoom: 13 })

    for (const p of places) {
      const pos = parseCoordinates(p.coordinates)
      if (!pos) continue
      const marker = new g.maps.Marker({ position: pos, map, title: p.name ?? p.id })
      marker.addListener('click', () => {
        navigate(`/place/${p.id}`, { state: { place: p } })
      })
    }
  }, [places, navigate])

  return (
    <div className="min-h-screen bg-background text-on-background">
      <div className="lg:ml-64 pt-20 pb-12 px-8">
        <h1 className="text-3xl font-extrabold mb-4">Map View</h1>
        {loading && <p className="text-sm text-slate-500">Loading map and places...</p>}
        <div ref={mapRef} style={{ width: '100%', height: '70vh' }} className="rounded-lg overflow-hidden shadow" />
        <p className="mt-4 text-sm text-slate-500">Markers limited to five configured places; click a marker to open the place detail.</p>
      </div>
    </div>
  )
}
