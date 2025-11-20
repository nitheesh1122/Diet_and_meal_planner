import React from 'react'
import { 
  Box, Container, Typography, Button, Stack, Grid, Card, CardContent, 
  Paper, useTheme, useMediaQuery
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Logo from '../components/Logo'
import LandingFooter from '../components/LandingFooter'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export default function Landing() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const features = [
    {
      icon: <RestaurantIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Personalized Meal Plans',
      description: 'AI-powered meal recommendations based on your unique nutrition goals, dietary preferences, and activity level.'
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Track Your Progress',
      description: 'Monitor your daily nutrition intake, macros, and progress towards your health goals with detailed analytics.'
    },
    {
      icon: <ShoppingCartIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Smart Grocery Lists',
      description: 'Automatically generate shopping lists from your planned meals to make grocery shopping effortless.'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
      title: 'Track Your Progress',
      description: 'Monitor your weight, body measurements, and fitness journey with detailed progress tracking and analytics.'
    }
  ]

  const benefits = [
    'Calculate your BMR, TDEE, and BMI automatically',
    'Track macros (protein, carbs, fats) in real-time',
    'Access extensive Indian meal database',
    'Get personalized calorie recommendations',
    'Monitor daily hydration goals',
    'View progress trends and insights'
  ]

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Stack spacing={4} alignItems="center" textAlign="center">
              <Box sx={{ mb: 2 }}>
                <Logo variant="full" size="large" />
              </Box>
              <Typography 
                variant={isMobile ? 'h3' : 'h2'} 
                fontWeight={800}
                sx={{ maxWidth: '800px' }}
              >
                Your Personal Nutrition Hub
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.95, 
                  maxWidth: '600px',
                  fontWeight: 400
                }}
              >
                Plan meals, track nutrition, and achieve your health goals with AI-powered meal recommendations tailored just for you.
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                sx={{ mt: 2 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/signup')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 700,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }} id="features">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography 
            variant="h4" 
            fontWeight={800} 
            textAlign="center" 
            gutterBottom
            sx={{ mb: 1 }}
          >
            Everything You Need
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            textAlign="center" 
            sx={{ mb: 6, maxWidth: '600px', mx: 'auto' }}
          >
            Powerful features designed to make meal planning and nutrition tracking simple and effective.
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Box sx={{ bgcolor: 'action.hover', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Typography variant="h4" fontWeight={800} gutterBottom>
                  Why Choose Meal Planner?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  We make nutrition tracking and meal planning effortless, so you can focus on achieving your health goals.
                </Typography>
                <Stack spacing={2}>
                  {benefits.map((benefit, index) => (
                    <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                      <CheckCircleIcon sx={{ color: 'success.main', mt: 0.5 }} />
                      <Typography variant="body1">{benefit}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    borderRadius: 3
                  }}
                >
                  <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
                    Start Your Journey Today
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Join thousands of users who are taking control of their nutrition and achieving their health goals.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/signup')}
                      fullWidth={isMobile}
                      sx={{
                        py: 1.5,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                        }
                      }}
                    >
                      Create Free Account
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/login')}
                      fullWidth={isMobile}
                    >
                      Sign In
                    </Button>
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer CTA */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Paper
              elevation={3}
              sx={{
                p: { xs: 4, md: 6 },
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Ready to Transform Your Nutrition?
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95, mb: 4, maxWidth: '500px', mx: 'auto' }}>
                Get started today and take the first step towards a healthier you.
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/signup')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    bgcolor: 'white',
                    color: 'primary.main',
                    fontWeight: 700,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                    }
                  }}
                >
                  Sign Up Now
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderColor: 'rgba(255,255,255,0.5)',
                    color: 'white',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  Already Have Account?
                </Button>
              </Stack>
            </Paper>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <LandingFooter />
    </Box>
  )
}

