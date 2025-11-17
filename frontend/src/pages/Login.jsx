import React from 'react'
import { 
  Card, CardContent, Typography, TextField, Button, Stack, Link, Box, Paper, Grid, Container
} from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function Login() {
  const { login, loading } = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    const res = await login(email, password)
    if (res.ok) navigate('/')
    else setError(res.message)
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: 'background.default' }}>
      <Container maxWidth="md">
        <Grid container spacing={3}>
          {/* Header Section */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Stack spacing={2} alignItems="center">
                <Logo variant="full" size="medium" />
                <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
                  Welcome Back! 👋
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, textAlign: 'center' }}>
                  Sign in to continue your nutrition journey
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* Login Form */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                  Login to Your Account
                </Typography>
                <form onSubmit={onSubmit}>
                  <Stack spacing={3}>
                    <TextField 
                      label="Email" 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      required 
                      fullWidth
                      variant="outlined"
                      size="medium"
                    />
                    <TextField 
                      label="Password" 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      fullWidth
                      variant="outlined"
                      size="medium"
                    />
                    {error && (
                      <Box sx={{ p: 2, bgcolor: 'error.50', borderRadius: 1, border: 1, borderColor: 'error.main' }}>
                        <Typography color="error" variant="body2">{error}</Typography>
                      </Box>
                    )}
                    <Button 
                      variant="contained" 
                      type="submit" 
                      disabled={loading} 
                      fullWidth
                      size="large"
                      sx={{ 
                        py: 1.5,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                        }
                      }}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                    <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                      Don't have an account?{' '}
                      <Link 
                        component={RouterLink} 
                        to="/signup"
                        sx={{ 
                          fontWeight: 600,
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        Sign up here
                      </Link>
                    </Typography>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
