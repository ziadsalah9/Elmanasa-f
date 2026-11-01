import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

const Layout = () => (
  <div className="app-shell">
    <Navbar />
    <main className="page-container">
      <Outlet />
    </main>
    <footer className="footer">
      © {new Date().getFullYear()} منصة مس رشا يحيى التعليمية — جميع الحقوق محفوظة
    </footer>
  </div>
)

export default Layout
