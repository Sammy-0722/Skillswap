import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const [status, setStatus] = useState('checking') // 'checking' | 'valid' | 'invalid'

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        setStatus('invalid')
        return
      }
      try {
const res = await fetch('https:localhost:8000/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        setStatus(data.valid ? 'valid' : 'invalid')
      } catch {
        setStatus('invalid')
      }
    }
    verify()
  }, [])

  if (status === 'checking') return null // or a spinner
  if (status === 'invalid') return <Navigate to="/login" replace />
  return children
}

export default ProtectedRoute