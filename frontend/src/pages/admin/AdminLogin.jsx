import React, { useState } from 'react'
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    InputAdornment,
    IconButton,
    Container
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Logo from '../../components/Logo'

export default function AdminLogin() {
    const navigate = useNavigate()
    const { loginAdmin, loading } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const result = await loginAdmin(formData.email, formData.password)
        if (!result.ok) {
            setError(result.message)
            return
        }
        navigate('/admin/dashboard')
    }

    return (
        <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    width: '100%',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Box sx={{ mb: 4 }}>
                    <Logo variant="full" size="large" />
                </Box>

                <Typography variant="h5" component="h1" gutterBottom fontWeight="bold" color="primary">
                    Admin Login
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Sign in to access the admin dashboard
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        margin="normal"
                        required
                        autoFocus
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        margin="normal"
                        required
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 4, mb: 2, height: 48 }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    )
}
