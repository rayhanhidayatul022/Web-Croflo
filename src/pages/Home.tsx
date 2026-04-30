import React from 'react'
import Header from '../components/Header'
import NavBar from '../components/NavBar'

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-on-background">
      <Header />
      <NavBar />

      <main className="lg:ml-64 pt-20 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Greeting */}
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-primary-container tracking-tight">Good Morning, Alex</h1>
            <p className="text-secondary font-medium mt-1">Ready to find your perfect workspace today?</p>
          </header>

          {/* Grid Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Large Feature Card: Current Spot (placeholder) */}
            <section className="col-span-12 lg:col-span-8">
              <div className="relative bg-white rounded-lg overflow-hidden shadow-lg border border-blue-50 h-[420px] group">
                <img alt="Cowo Working Space" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7nQUkXndvu0Rnpdasph_AmhGo-lRV1ccVw4ECVfrXQ1mwetttnW7JiOa6rdDK8kUvjoc3BMaH_bySgdTwaabCooCrHNDX-am1DpsP3zWHzPJr8LVlwR9K3hjzlp8s4Fsj60HgjiiVQqlh30aMi8pXAFEObUWC-395qBmzB6p0PRB-z2lKXiiopCyeNO9hpLwqMkoJ7y2FpvNthugVsiGSDPaNVFjNuKYHZg-CrTj-WomvVcpw68MKUm_--q8oKKJdWsNT5aNizg" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-container/90 via-primary-container/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                      <span className="text-sky-tint text-sm font-bold uppercase tracking-widest">Live Now</span>
                    </div>
                    <h3 className="text-white text-3xl font-extrabold mb-1">Cowo Working Space</h3>
                    <p className="text-blue-100/80 font-medium">Sudirman, South Jakarta</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20 text-center min-w-[140px]">
                    <span className="block text-4xl font-black text-white leading-none">84%</span>
                    <span className="text-[10px] text-blue-100 uppercase tracking-widest font-bold mt-2 block">Current Occupancy</span>
                  </div>
                </div>
                <div className="absolute top-6 left-6">
                  <span className="bg-white/90 backdrop-blur-sm text-primary-container px-4 py-2 rounded-full text-xs font-bold shadow-sm">Your Current Spot</span>
                </div>
              </div>
            </section>

            {/* Hotspots Mini Map */}
            <section className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-lg p-6 shadow-lg border border-blue-50 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-primary-container">Crowd Hotspots</h3>
                  <span className="text-pacific-blue text-xs font-bold cursor-pointer hover:underline">View Map</span>
                </div>
                <div className="relative flex-1 rounded-lg overflow-hidden border border-blue-50 bg-slate-100">
                  <img alt="City Map Preview" className="w-full h-full object-cover grayscale opacity-50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnliTmhb07m0h_4DiIofSo4LenedJuertRw3OYz6yqWYG5EmiCsL4NvI1DEYhKA3bxzc6M1KN0OG5Lp_DPFaLTFrdFigaAJ33XFuread5MzaJumyb4Svytzy4wZ4xVtZA3L2k1gm2rk-BUg9m7YbX6ibY8eS2PPQVQN3ABlBaNoQWptlWw8pJXh8CjO9svuBRWtHsVLc6_L1uVHvYHRDozEt_-TBYHvevhtOsvg90YVB8AXTt0v1sPQwpshbD1t02hEHfHc6ti7A" />
                  <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-error rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                  <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-secondary rounded-full border-2 border-white shadow-lg"></div>
                  <div className="absolute top-1/2 right-1/2 w-3 h-3 bg-ocean-teal rounded-full border-2 border-white shadow-lg"></div>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-error"></div>
                      <span className="text-sm font-semibold text-on-surface">SCBD District</span>
                    </div>
                    <span className="text-xs font-bold text-error">High</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-secondary-container"></div>
                      <span className="text-sm font-semibold text-on-surface">Senopati Area</span>
                    </div>
                    <span className="text-xs font-bold text-secondary">Medium</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Recommended For You Section */}
            <section className="col-span-12 mt-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-primary-container tracking-tight">Recommended for You</h3>
                <button className="flex items-center gap-2 text-pacific-blue font-bold text-sm hover:gap-3 transition-all">
                  See all recommendations
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Recommendation 1 */}
                <div className="bg-white rounded-lg p-4 shadow-lg border border-blue-50 flex items-center gap-5 hover:border-pacific-blue transition-all group cursor-pointer">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img alt="Jabarano Coffee" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqHtXeNrGuQzpMNM5kTKfACtnroNpyIeG28gMdb4_rPu4W6TumOId0CGeeE3y4TIYrBQg6ibPTGVpigHThrowMwY7npuYRScEsn0Cge5ZGMRzA4mPW-sreDvEnJLhuxN6wxJhgeS-HDM_TpwnRYEwcTf-ltHQ-kLcWUTY2EsrgUSZt0930DSzK3EzypV1IT1AANdHSHyX6HCHS4Pi2qA99rHNG8z3EHdUc-tBL8dYLRZ37W8bYNsFMMUfa2MUXJjtibB33sRYcpA" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-ocean-teal uppercase tracking-widest mb-1 block">Best for Focus</span>
                    <h4 className="text-lg font-bold text-primary-container">Jabarano Coffee</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-xs text-slate-400">group</span>
                      <span className="text-xs font-semibold text-slate-500">22% Crowded</span>
                    </div>
                    <div className="mt-2 flex gap-1">
                      <span className="w-2 h-1 rounded-full bg-emerald-400"></span>
                      <span className="w-2 h-1 rounded-full bg-slate-100"></span>
                      <span className="w-2 h-1 rounded-full bg-slate-100"></span>
                    </div>
                  </div>
                </div>
                {/* Recommendation 2 */}
                <div className="bg-white rounded-lg p-4 shadow-lg border border-blue-50 flex items-center gap-5 hover:border-pacific-blue transition-all group cursor-pointer">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img alt="Bagi Kopi" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX02AmyI_GwqVILUWqiLnAGqe4-aTG2qrw9deC5iKJiHltxqhgJLurudtQFPDXlgDJRTZ-nAP2F3XUj0Kcp-naxd_d3BKuV-7pS0fkFUyiqSghU9I6l6NzlhWM7MOnY38zcclBtnXdP8pn97PHVE5UrkFz-I9lS-l5wPrVLUb4X3PG14kEgtUri6J3Ape1IqrozimxJENnjF3KtwoT7mQ9RoLHH-n04HWwlWrxavR8Zzc1LVx7kP3shomfOFSuke-bG8_EYgN99Q" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1 block">Near You</span>
                    <h4 className="text-lg font-bold text-primary-container">Bagi Kopi</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="material-symbols-outlined text-xs text-slate-400">group</span>
                      <span className="text-xs font-semibold text-slate-500">45% Crowded</span>
                    </div>
                    <div className="mt-2 flex gap-1">
                      <span className="w-2 h-1 rounded-full bg-yellow-400"></span>
                      <span className="w-2 h-1 rounded-full bg-yellow-400"></span>
                      <span className="w-2 h-1 rounded-full bg-slate-100"></span>
                    </div>
                  </div>
                </div>
                {/* Recommendation 3 */}
                <div className="bg-gradient-to-br from-primary-container to-secondary rounded-lg p-6 shadow-lg border border-blue-50 flex flex-col justify-center">
                  <h4 className="text-white font-extrabold text-xl mb-2">Want more privacy?</h4>
                  <p className="text-blue-100 text-sm mb-4">Book a private meeting pod starting from $12/hr</p>
                  <button className="bg-white text-primary-container px-4 py-2 rounded-full text-xs font-bold self-start hover:bg-sky-tint transition-colors">
                    Explore Pods
                  </button>
                </div>
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
