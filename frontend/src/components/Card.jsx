import React from 'react'

export default function Card({ id, title, subtitle, image, onClick }) {
  // Neo-Brutalism Card: Simple structural HTML, heavier lifting done by CSS
  return (
    <div
      className="neo-card"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Image Container with Border */}
      <div style={{
        width: '100%',
        aspectRatio: '1/1',
        border: '4px solid #000',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000'
      }}>
        {image ? (
          <img
            src={image}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'grayscale(100%) contrast(1.2)' // Neo-brutalist touch: high contrast grayscale
            }}
            onMouseOver={e => e.currentTarget.style.filter = 'none'} // Reveal color on hover
            onMouseOut={e => e.currentTarget.style.filter = 'grayscale(100%) contrast(1.2)'}
          />
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--neo-yellow)',
            color: 'black',
            fontWeight: '900',
            textTransform: 'uppercase',
            fontSize: '24px'
          }}>
            No Image
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{
          fontSize: '20px',
          lineHeight: '1.1',
          backgroundColor: 'var(--neo-black)',
          color: 'var(--neo-white)',
          padding: '4px 8px',
          display: 'inline-block',
          width: 'fit-content'
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '16px',
          fontWeight: '700',
          color: 'var(--neo-black)',
          opacity: 0.8
        }}>
          {subtitle}
        </p>
      </div>
    </div>
  )
}
