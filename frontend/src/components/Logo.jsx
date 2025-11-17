import React from 'react'
import { Box } from '@mui/material'

// Logo component that can be used throughout the app
// Place your logo files in frontend/public/ folder:
// - logo.png (or .svg) - Full logo with text
// - logo-icon.png (or .svg) - Icon only version for collapsed sidebar
// - favicon.ico - For browser tab icon

export default function Logo({ variant = 'full', size = 'medium', collapsed = false }) {
  const sizes = {
    small: { width: 32, height: 32, fontSize: 14 },
    medium: { width: 48, height: 48, fontSize: 18 },
    large: { width: 64, height: 64, fontSize: 24 }
  }

  const { width, height, fontSize } = sizes[size]

  // Logo file paths - Update these to match your actual file names
  const logoIconPath = '/logo-icon.png' // or .svg - Icon only version
  const logoFullPath = '/logo.png' // or .svg - Full logo with text
  
  // State to track if image failed to load
  const [imageError, setImageError] = React.useState(false)
  const [iconError, setIconError] = React.useState(false)

  if (collapsed || variant === 'icon') {
    // Icon-only version (for collapsed sidebar)
    if (iconError) {
      // Fallback: Gradient circle with MP
      return (
        <Box
          sx={{
            width,
            height,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: fontSize * 0.7,
          }}
        >
          MP
        </Box>
      )
    }
    
    return (
      <Box
        component="img"
        src={logoIconPath}
        alt="Meal Planner"
        onError={() => setIconError(true)}
        sx={{
          width,
          height,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    )
  }

  // Full logo version
  if (imageError) {
    // Fallback: Text-based logo
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width,
            height,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: fontSize * 0.7,
            flexShrink: 0,
          }}
        >
          MP
        </Box>
        <Box>
          <Box
            component="span"
            sx={{
              fontSize,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              display: 'block',
              lineHeight: 1.2,
            }}
          >
            Meal Planner
          </Box>
          <Box
            component="span"
            sx={{
              fontSize: fontSize * 0.6,
              color: 'text.secondary',
              display: 'block',
              lineHeight: 1,
            }}
          >
            Your Nutrition Hub
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      component="img"
      src={logoFullPath}
      alt="Meal Planner"
      onError={() => setImageError(true)}
      sx={{
        height,
        width: 'auto',
        maxWidth: '200px',
        objectFit: 'contain',
        flexShrink: 0,
      }}
    />
  )
}

