import React, { useState, useEffect } from 'react'
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../services/firebase'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) navigate('/')
    })
    return () => unsubscribe()
  }, [navigate])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password)
      
      // Create user document in Firestore with username as requested
      await setDoc(doc(db, 'users', userCred.user.uid), {
        username: username,
        email: email,
        savedPlaces: [],
        createdAt: serverTimestamp()
      })

      navigate('/')
    } catch (err: any) {
      console.error(err)
      let errorMessage = 'Pendaftaran gagal. Silakan coba lagi.'
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.'
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah. Minimal harus 6 karakter.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.'
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    try {
      const userCred = await signInWithPopup(auth, googleProvider)
      
      // For Google sign-in, we use setDoc with merge: true so we don't overwrite if it exists
      await setDoc(doc(db, 'users', userCred.user.uid), {
        username: userCred.user.displayName || 'Google User',
        email: userCred.user.email,
        savedPlaces: [],
        createdAt: serverTimestamp()
      }, { merge: true })

      navigate('/')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Google sign-in failed.')
    }
  }

  return (
    <div className="min-h-screen flex selection:bg-secondary-container bg-surface-container-low font-body">
      {/* Left Form Area */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10 bg-white shadow-2xl">
        <div className="w-full max-w-sm mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 mb-10 hover:scale-105 transition-transform w-fit">
            <img src={logo} alt="Croflo Logo" className="h-10 object-contain" />
          </Link>
          
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-[#0F2046] tracking-tight mb-2">Create an account</h1>
            <p className="text-sm font-medium text-slate-500">Join the smart crowd intelligence network.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 mb-6 rounded-2xl flex items-start gap-3 shadow-sm">
              <span className="material-symbols-outlined text-red-500 text-xl">error</span>
              <p className="text-sm font-medium text-red-700 leading-tight pt-0.5">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Username</label>
              <input 
                type="text"
                required
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="w-full rounded-2xl border-2 border-slate-100 px-4 py-3.5 focus:border-[#0F2046] focus:ring-0 transition-colors font-medium text-sm placeholder:text-slate-300"
                placeholder="e.g. coffee_lover_99"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email"
                required
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full rounded-2xl border-2 border-slate-100 px-4 py-3.5 focus:border-[#0F2046] focus:ring-0 transition-colors font-medium text-sm placeholder:text-slate-300"
                placeholder="dummy@croflo.com"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password" 
                required
                minLength={6}
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full rounded-2xl border-2 border-slate-100 px-4 py-3.5 focus:border-[#0F2046] focus:ring-0 transition-colors font-medium text-sm placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0F2046] text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#0F2046]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100 mt-2"
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>

            <div className="relative flex items-center py-3">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or register with</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <button 
              type="button" 
              onClick={handleGoogle} 
              className="w-full bg-white border-2 border-slate-100 text-slate-700 py-3.5 rounded-2xl font-bold text-sm hover:border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              <span>Google</span>
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-medium text-slate-500">
            Already have an account? <Link to="/login" className="font-bold text-[#0F2046] hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right Image Area */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2000&auto=format&fit=crop" 
          alt="Cafe ambient" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0F2046]/90 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-16 pb-24">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black text-white uppercase tracking-widest mb-6 border border-white/30">
              Join the Network
            </span>
            <h2 className="text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Your perfect spot is waiting.
            </h2>
            <p className="text-lg font-medium text-slate-200 leading-relaxed">
              Sign up today to save your favorite places, contribute live reports, and unlock advanced density intelligence.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
