import React from 'react'

export default function NavBar() {
  return (
    <aside className="fixed left-0 top-0 h-full flex flex-col pt-16 py-4 w-64 bg-slate-50 border-r border-blue-50 z-40 hidden lg:flex">
      <nav className="px-3 mt-2">
        <a className="flex items-center gap-3 bg-blue-100 text-blue-900 rounded-full px-4 py-3 my-2 font-sans text-sm duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span>Home</span>
        </a>
        <a className="flex items-center gap-3 text-slate-500 px-4 py-3 my-2 font-sans text-sm hover:bg-blue-50 rounded-full transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined">map</span>
          <span>Map View</span>
        </a>
        <a className="flex items-center gap-3 text-slate-500 px-4 py-3 my-2 font-sans text-sm hover:bg-blue-50 rounded-full transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined">location_on</span>
          <span>Places</span>
        </a>
        <a className="flex items-center gap-3 text-slate-500 px-4 py-3 my-2 font-sans text-sm hover:bg-blue-50 rounded-full transition-all duration-200 ease-in-out" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </a>
      </nav>

      <div className="px-4 mt-auto mb-6">
        <div className="flex flex-col gap-1">
          <a className="flex items-center gap-3 text-slate-500 px-4 py-3 font-sans text-sm hover:bg-blue-50 rounded-full transition-all" href="#">
            <span className="material-symbols-outlined">help</span>
            <span>Help</span>
          </a>
          <a className="flex items-center gap-3 text-slate-500 px-4 py-3 font-sans text-sm hover:bg-blue-50 rounded-full transition-all" href="#">
            <span className="material-symbols-outlined">logout</span>
            <span>Logout</span>
          </a>
        </div>
      </div>
    </aside>
  )
}
