import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { applyTheme } from '../auth'
import Footer from './Footer'
import './Login.css'

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const response = await axios.post('/api/auth/login', {
        phoneNumber,
        password
      })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data))
      applyTheme(response.data.theme || 'dark')
      navigate('/dashboard')
    } catch (err) {
      setError('رقم الهاتف أو كلمة المرور غير صحيحة')
    }
  }

  return (
    <div className="auth-shell">
      <div className="login-container">
        <div className="login-card">
        <h2 className="login-title">منصة مس رشا يحيى التعليمية</h2>
        <h3 className="login-subtitle">تسجيل الدخول</h3>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="phoneNumber">رقم الهاتف أو اسم المستخدم</label>
            <input
              type="text"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="أدخل رقم الهاتف"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">كلمة المرور</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button">دخول</button>
          <p style={{ textAlign: 'center', marginTop: '15px' }}>
            <a href="/register" style={{ color: '#667eea', textDecoration: 'none' }}>تسجيل حساب جديد</a>
          </p>
        </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Login