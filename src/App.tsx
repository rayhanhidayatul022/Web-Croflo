import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import DetailPlace from './pages/DetailPlace'
import MapView from './pages/MapView'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/place/:id" element={<DetailPlace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/map" element={<MapView />} />
      </Routes>
    </>
  )
}
