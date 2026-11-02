import React from 'react'
import logo from '../assets/elmansa-logo.webp'

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
  </svg>
)

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">
            <img src={logo} alt="" aria-hidden="true" />
          </span>
          <span className="footer-brand-text">
            <strong>منصة مس رشا يحيى التعليمية</strong>
            <small>تعلّم أوضح، ومستقبل أفضل</small>
          </span>
        </div>

        <div className="footer-creator">
          <span className="footer-kicker">تصميم وتطوير المنصة</span>
          <strong className="footer-name">زياد صلاح</strong>
          <div className="footer-phones">
            <a href="tel:01020061562" className="footer-phone">
              <PhoneIcon />
              <span dir="ltr">01020061562</span>
            </a>
            <a href="tel:01032836581" className="footer-phone">
              <PhoneIcon />
              <span dir="ltr">01032836581</span>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © {year} منصة مس رشا يحيى التعليمية — جميع الحقوق محفوظة
      </div>
    </footer>
  )
}

export default Footer
