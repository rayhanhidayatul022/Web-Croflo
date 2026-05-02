import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import logo from '../assets/logo.png'

export default function NavBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  const base = 'flex items-center gap-3 py-3 px-4 rounded-lg transition-colors duration-200 cursor-pointer active:scale-95 font-sans tracking-tight text-sm'
  const activeCls = 'text-[#0f2046] font-semibold bg-blue-50/50'
  const inactiveCls = 'text-slate-500 hover:text-[#0f2046] hover:bg-blue-50 font-medium'

  const isHome = pathname === '/' || pathname === '' || pathname.startsWith('/place')
  const isMap = pathname.startsWith('/map')

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200 bg-slate-50 flex flex-col py-6 px-4 z-50 hidden lg:flex">
      <img src={logo} alt="Croflo" className="h-6 mb-8 px-4 w-auto" />
      <nav className="flex-1 space-y-2">
        <Link to="/" className={`${base} ${isHome ? activeCls : inactiveCls}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span>Home</span>
        </Link>
        <Link to="/map" className={`${base} ${isMap ? activeCls : inactiveCls}`}>
          <span className="material-symbols-outlined">map</span>
          <span>Map View</span>
        </Link>
      </nav>

      <div className="mt-auto px-4 pt-6 border-t border-slate-200">
        <div className="flex flex-col gap-1">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 text-slate-500 px-4 py-3 font-sans text-sm hover:bg-blue-50 hover:text-red-600 rounded-full transition-all text-left">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
