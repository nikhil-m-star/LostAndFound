import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export default function Card({ id, title, subtitle, image, onClick }) {
  const ref = useRef(null)
  const [imgError, setImgError] = React.useState(false)

  // Motion values for mouse position relative to the card center
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Spring animations for smooth tilt return
  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  // Transform mouse x/y to rotation degrees
  // Adjust these values to control tilt intensity (e.g., -10deg to 10deg)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"])

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    // Calculate mouse position relative to card center (-0.5 to 0.5)
    // 0 is center, -0.5 is left/top, 0.5 is right/bottom
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = mouseX / width - 0.5
    const yPct = mouseY / height - 0.5

    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseLeave = () => {
    // Reset tilt on leave
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      className="card"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        rotateX,
        rotateY,
        transformStyle: "preserve-3d", // Critical for 3D effect
        perspective: 1000 // Adds depth
      }}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.02 }} // Slight scale up on hover
    >
      {/* Gloss Effect Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          borderRadius: 16, // Matches .card border-radius
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.0) 50%)",
          opacity: 0,
          pointerEvents: "none",
          transition: "opacity 0.3s"
        }}
      />

      <div className="thumb" style={{ transform: "translateZ(20px)" }}>
        {/* translateZ makes image pop out */}
        {image && !imgError ? (
          <img
            src={image}
            alt={title}
            onError={() => setImgError(true)}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, color: '#555', border: '1px solid #222' }}>
            No Image
          </div>
        )}
      </div>
      <div className="meta" style={{ transform: "translateZ(30px)" }}>
        {/* translateZ makes text pop out even more */}
        <div className="title">{title}</div>
        <div className="sub">{subtitle}</div>
      </div>
    </motion.div>
  )
}
