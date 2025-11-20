import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import Logo from './Logo'

export default function PageTransitionSpinner({ loading }) {
  const [progress, setProgress] = React.useState(1)

  React.useEffect(() => {
    if (!loading) {
      setProgress(1)
      return
    }

    // Random duration between 4-5 seconds
    const duration = 4000 + Math.random() * 1000 // 4000ms to 5000ms
    const startTime = Date.now()
    const interval = 16 // ~60fps

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(100, 1 + (elapsed / duration) * 99)
      setProgress(newProgress)

      if (newProgress >= 100) {
        clearInterval(timer)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [loading])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          {/* Backdrop with progressive blur effect */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backdropFilter: `blur(${Math.min(progress * 0.25, 25)}px)`,
              WebkitBackdropFilter: `blur(${Math.min(progress * 0.25, 25)}px)`,
              bgcolor: `rgba(0, 0, 0, ${Math.min(progress * 0.015, 0.6)})`,
              transition: 'all 0.3s ease'
            }}
          />

          {/* Spinner Content */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              bgcolor: 'background.paper',
              borderRadius: 4,
              p: 4,
              boxShadow: 6
            }}
          >
            {/* Logo */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{ marginBottom: 24 }}
            >
              <Logo variant="full" size="large" />
            </motion.div>

            {/* Circular Progress */}
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
              <CircularProgress
                variant="determinate"
                value={progress}
                size={80}
                thickness={4}
                sx={{
                  color: 'primary.main',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  }
                }}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="h6"
                  component="div"
                  fontWeight={700}
                  sx={{ color: 'primary.main' }}
                >
                  {Math.round(progress)}%
                </Typography>
              </Box>
            </Box>

            {/* Loading Text */}
            <Typography
              variant="body1"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                textAlign: 'center'
              }}
            >
              Loading...
            </Typography>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

