import React, { useState } from 'react'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../services/firebase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      alert('Logged in')
    } catch (err) {
      console.error(err)
      alert('Login failed')
    }
  }

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
      alert('Logged in with Google')
    } catch (err) {
      console.error(err)
      alert('Google sign-in failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Sign in</h2>
        <label className="block mb-3">
          <div className="text-sm font-medium mb-1">Email</div>
          <input value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded border px-3 py-2" />
        </label>
        <label className="block mb-4">
          <div className="text-sm font-medium mb-1">Password</div>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded border px-3 py-2" />
        </label>
        <div className="flex gap-2">
          <button type="submit" className="bg-primary-container text-on-primary px-4 py-2 rounded">Sign in</button>
          <button type="button" onClick={handleGoogle} className="border px-4 py-2 rounded">Sign in with Google</button>
        </div>
      </form>
    </div>
  )
}
