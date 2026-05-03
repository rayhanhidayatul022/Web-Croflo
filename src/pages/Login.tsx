import React, { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../services/firebase'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Login() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/')
    } catch (err: any) {
      console.error(err)
      let errorMessage = 'Gagal masuk. Silakan coba lagi.'
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Email atau password yang Anda masukkan salah.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.'
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi nanti.'
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Google sign-in failed')
    }
  }

  return (
    <div className="min-h-screen flex selection:bg-secondary-container bg-surface-container-low font-body">
      {/* Left Form Area */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative z-10 bg-white shadow-2xl">
        <div className="w-full max-w-sm mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 mb-12 hover:scale-105 transition-transform w-fit">
            <img src={logo} alt="Croflo Logo" className="h-10 object-contain" />
          </Link>
          
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-[#0F2046] tracking-tight">Welcome back</h1>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 p-4 mb-6 rounded-2xl">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Demo Account
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="font-medium text-blue-900/80">Email:</div>
              <div className="font-bold text-blue-900">dummy@croflo.com</div>
              <div className="font-medium text-blue-900/80">Password:</div>
              <div className="font-bold text-blue-900">123456</div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 p-4 mb-6 rounded-2xl flex items-start gap-3 shadow-sm">
              <span className="material-symbols-outlined text-red-500 text-xl">error</span>
              <p className="text-sm font-medium text-red-700 leading-tight pt-0.5">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
              </div>
              <input 
                type="password" 
                required
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full rounded-2xl border-2 border-slate-100 px-4 py-3.5 focus:border-[#0F2046] focus:ring-0 transition-colors font-medium text-sm placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#0F2046] text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#0F2046]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>

            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
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

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Don't have an account? <Link to="/register" className="font-bold text-[#0F2046] hover:underline">Sign up for free</Link>
          </p>
        </div>
      </div>

      {/* Right Image Area */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden bg-[#0F2046]">
        <img 
          src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2000&auto=format&fit=crop" 
          alt="Coffee shop crowd" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F2046]/80 to-[#435d97]/40"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-16 pb-24">
          <div className="max-w-xl">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black text-white uppercase tracking-widest mb-6 border border-white/30">
              Crowded Detection
            </span>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              A smart system that helps users find less crowded places in real-time
            </h2>
          </div>
        </div>
      </div>
    </div>
  )
}
