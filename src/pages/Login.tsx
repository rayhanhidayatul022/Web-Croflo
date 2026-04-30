import React, { useState } from 'react'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { initFirebase } from '../services/firebase'

initFirebase()

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const auth = getAuth()
      await signInWithEmailAndPassword(auth, email, password)
      alert('Logged in')
    } catch (err) {
      alert('Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <label>
        Email
        <input value={email} onChange={e => setEmail(e.target.value)} />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </label>
      <button type="submit">Sign in</button>
    </form>
  )
}
