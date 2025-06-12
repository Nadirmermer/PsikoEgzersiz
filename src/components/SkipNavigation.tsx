
import React from 'react'

const SkipNavigation: React.FC = () => {
  return (
    <>
      <a 
        href="#main-content" 
        className="skip-link"
        aria-label="Ana içeriğe geç"
      >
        Ana içeriğe geç
      </a>
      <a 
        href="#navigation" 
        className="skip-link"
        style={{ top: '4rem' }}
        aria-label="Navigasyona geç"
      >
        Navigasyona geç
      </a>
    </>
  )
}

export default SkipNavigation
