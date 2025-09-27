import React from 'react'
import { Card, CardContent, Typography, TextField, Button, Stack, Link } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { Link as RouterLink, useNavigate } from 'react-router-dom'

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
    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '60vh' }}>
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Login</Typography>
          <form onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
              <TextField label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
              {error && <Typography color="error" variant="body2">{error}</Typography>}
              <Button variant="contained" type="submit" disabled={loading}>Login</Button>
              <Typography variant="body2">Don't have an account? <Link component={RouterLink} to="/signup">Sign up</Link></Typography>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Stack>
  )
}
