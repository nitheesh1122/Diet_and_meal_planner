import React from 'react'
import { Box, Container, Typography, Stack, Link, Divider } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import Logo from './Logo'

export default function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {/* Main Footer Content */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={4}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'flex-start' }}
          >
            {/* Logo and Company Info */}
            <Box sx={{ maxWidth: { xs: '100%', md: '300px' } }}>
              <Logo variant="full" size="medium" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Your personal nutrition hub. Plan meals, track nutrition, and achieve your health goals with AI-powered meal recommendations.
              </Typography>
            </Box>

            {/* Quick Links */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Product
                </Typography>
                <Stack spacing={1}>
                  <Link component={RouterLink} to="/signup" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                    Get Started
                  </Link>
                  <Link component={RouterLink} to="/login" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                    Sign In
                  </Link>
                  <Link href="#features" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                    Features
                  </Link>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Company
                </Typography>
                <Stack spacing={1}>
                  <Link component={RouterLink} to="/contact" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                    Contact Us
                  </Link>
                  <Link component={RouterLink} to="/privacy" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                    Privacy Policy
                  </Link>
                  <Link component={RouterLink} to="/terms" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                    Terms of Service
                  </Link>
                </Stack>
              </Box>
            </Stack>
          </Stack>

          <Divider />

          {/* Copyright */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="body2" color="text.secondary">
              © {currentYear} <Box component="span" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Meal Planner</Box>. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3} flexWrap="wrap" justifyContent="center">
              <Link component={RouterLink} to="/privacy" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Privacy Policy
              </Link>
              <Link component={RouterLink} to="/terms" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Terms of Service
              </Link>
              <Link component={RouterLink} to="/contact" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Contact
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

