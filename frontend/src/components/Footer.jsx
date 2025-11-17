import React from 'react'
import { Box, Container, Typography, Stack, Link, Divider } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={4}>
          {/* Main Footer Content */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={4}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            {/* Logo and Company Info */}
            <Box>
              <Logo variant="full" size="small" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Smart meal planning powered by AI
              </Typography>
            </Box>

            {/* Quick Links */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Product
                </Typography>
                <Stack spacing={0.5}>
                  <Link component={RouterLink} to="/" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                    Dashboard
                  </Link>
                  <Link component={RouterLink} to="/planner" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                    Meal Planner
                  </Link>
                  <Link component={RouterLink} to="/recipes" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                    Recipes
                  </Link>
                  <Link component={RouterLink} to="/grocery" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                    Grocery List
                  </Link>
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Settings
                </Typography>
                <Stack spacing={0.5}>
                  <Link component={RouterLink} to="/settings" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                    Settings
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
              © {currentYear} <Box component="span" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>NutriIQ</Box>. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Privacy Policy
              </Link>
              <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Terms of Service
              </Link>
              <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                Contact
              </Link>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}

