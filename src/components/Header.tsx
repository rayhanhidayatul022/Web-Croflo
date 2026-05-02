import React, { useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import { Link } from 'react-router-dom'
import { auth, db } from '../services/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

export default function Header() {
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

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-sm">
      <div className="flex items-center gap-4">
        <img src={logo} alt="Croflo" className="h-8" />
      </div>

      <div className="flex-1 px-6">
      </div>

      <div className="flex items-center gap-4">
        <Link to="/map" className="bg-primary-container text-on-primary px-4 py-2 rounded-full text-sm font-bold hover:shadow-md hover:shadow-primary-container/30 hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] animate-pulse">radar</span>
          <span>Monitor Live</span>
        </Link>
        <div className="flex flex-col items-end justify-center">
          <span className="text-sm font-bold text-[#0F2046] leading-tight">{userName}</span>
          <span className="text-[10px] text-slate-400 font-medium leading-tight">Dummy User</span>
        </div>
        <div className="h-8 w-8 rounded-full overflow-hidden border border-blue-100">
          <img alt="User profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMgBSn05_1BJb8MR2TiAX7ieZB8dwcxNRbvtF7IMKHNJ5dt7Y6MvW_jROwMwweEHBc6DRn5ndRgecH5I0EGHgg63iZszcNs6UdWLobQ4rdjPIJRsxodq5OORO_VtMR0xljC_FBex5-hcu53iz30vSoC2GtilSkk-mlsXhQFuryLBVdH1HNN6-dmqwXr-ybOtIODfpG7jYlns9cR0xO5CZpME0cbXj2OiqsnbOVyoBXx3W01zNtcidXhQONOvjmwaoCrY-Jasivdw" />
        </div>
      </div>
    </header>
  )
}
