import React, { useRef, useId, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export default function Card({ id, title, subtitle, image, onClick }) {
  const uniqueId = useId().replace(/:/g, '') // Sanitize ID for DOM
  const filterId = `glass-distortion-${uniqueId}`

  const cardRef = useRef(null)
  const filterRef = useRef(null)
  const specularRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Update filter turbulence based on mouse position
    // Calculate scale based on position (similar to requested logic)
    const scaleX = (x / rect.width) * 100
    const scaleY = (y / rect.height) * 100
    const scaleVal = Math.min(scaleX, scaleY)

    if (filterRef.current) {
      filterRef.current.setAttribute('scale', scaleVal)
    }

    // Update specular highlight position
    if (specularRef.current) {
      specularRef.current.style.background = `radial-gradient(
            circle at ${x}px ${y}px,
            rgba(255, 255, 255, 0.4) 0%,
            rgba(255, 255, 255, 0.1) 30%,
            rgba(255, 255, 255, 0) 60%
        )`
      specularRef.current.style.opacity = 1
    }
  }

  const handleMouseLeave = () => {
    // Reset effects
    if (filterRef.current) {
      filterRef.current.setAttribute('scale', '77') // Reset to default scale
    }
    if (specularRef.current) {
      specularRef.current.style.background = 'radial-gradient(circle at center, rgba(255,255,255,0.0) 0%, transparent 100%)'
      specularRef.current.style.opacity = 0
    }
  }

  return (
    <motion.div
      ref={cardRef}
      className="glass-card"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Unique SVG Filter for this card */}
      <svg style={{ display: 'none' }}>
        <filter id={filterId}>
          <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2" result="noise" />
          <feDisplacementMap
            ref={filterRef}
            in="SourceGraphic"
            in2="noise"
            scale="77"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      {/* Glass Layers */}
      <div
        className="glass-filter"
        style={{ filter: `url(#${filterId}) saturate(120%) brightness(1.15) blur(1px)` }} // Apply the unique filter
      />
      <div className="glass-distortion-overlay" />
      <div className="glass-overlay" />
      <div className="glass-specular" ref={specularRef} />

      {/* Content */}
      <div className="glass-content">
        {image && (
          <img src={image} alt={title} className="glass-image" />
        )}

        {/* Text Overlay (z-index higher) */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'left', width: '100%' }}>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
    </motion.div>
  )
}
