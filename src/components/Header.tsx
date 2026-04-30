import React from 'react'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold tracking-tighter text-blue-900">Croflo</span>
      </div>

      <div className="flex-1 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              aria-label="Search"
              placeholder="Bandung, Indonesia"
              className="w-full rounded-full border border-slate-200 bg-white/60 py-2 px-4 pl-10 text-sm shadow-sm focus:outline-none"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">search</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="bg-primary-container text-on-primary px-4 py-2 rounded-full text-sm font-medium hover:opacity-95">Monitor Live</button>
        <button className="p-2 text-slate-500 hover:text-blue-600 transition-all">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 text-slate-500 hover:text-blue-600 transition-all">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-8 w-8 rounded-full overflow-hidden border border-blue-100">
          <img alt="User profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMgBSn05_1BJb8MR2TiAX7ieZB8dwcxNRbvtF7IMKHNJ5dt7Y6MvW_jROwMwweEHBc6DRn5ndRgecH5I0EGHgg63iZszcNs6UdWLobQ4rdjPIJRsxodq5OORO_VtMR0xljC_FBex5-hcu53iz30vSoC2GtilSkk-mlsXhQFuryLBVdH1HNN6-dmqwXr-ybOtIODfpG7jYlns9cR0xO5CZpME0cbXj2OiqsnbOVyoBXx3W01zNtcidXhQONOvjmwaoCrY-Jasivdw" />
        </div>
      </div>
    </header>
  )
}
