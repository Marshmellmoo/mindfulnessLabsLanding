import { useState, useEffect } from 'react'
import './Hero.css'
import logo from '../assets/logo.png'

function Hero() {
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setOffsetY(window.pageYOffset)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="home" className="hero">
      <div className="hero-background" style={{ transform: `translateY(${offsetY * 0.5}px)` }} />
      <div className="hero-content">
        <p className="hero-subtitle">Empowering wellness in your school—made easy.</p>
        <div className="hero-title-container">
          <h1 className="hero-title">
            Mindfulness Labs
          </h1>
          <img src={logo} alt="Mindfulness Labs Logo" className="hero-logo" />
        </div>
        <p className="hero-description">
          Culturally responsive, trauma-informed wellness tools designed to integrate seamlessly into school communities and support educators with responsible, evidence-based AI.
        </p>
        <div className="button-group">
            <button className="cta-button" onClick={() => scrollToSection('contact')}>
            Join Mailing List
            <span className="button-arrow">→</span>
            </button>
            <button className="cta-button" onClick={() => scrollToSection('about')}>
            See How It Works
            <span className="button-arrow">→</span>
            </button>
        </div>
      </div>
    </section>
  )
}

export default Hero
