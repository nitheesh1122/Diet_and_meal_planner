import React from 'react'
import { Card, CardContent, Typography, TextField, Button, Stack, MenuItem } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const { signup, loading } = useAuth()
  const [form, setForm] = React.useState({
    name: '', email: '', password: '', age: 25, gender: 'male', height: 175, weight: 70, goal: 'maintain', activityLevel: 'moderate', dietaryRestrictions: ['none']
  })
  const [error, setError] = React.useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    const res = await signup(form)
    if (res.ok) navigate('/')
    else setError(res.message)
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  return (
    <Stack alignItems="center" justifyContent="center" sx={{ minHeight: '60vh' }}>
      <Card sx={{ maxWidth: 560, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Sign Up</Typography>
          <form onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField label="Name" name="name" value={form.name} onChange={onChange} required />
              <TextField label="Email" name="email" type="email" value={form.email} onChange={onChange} required />
              <TextField label="Password" name="password" type="password" value={form.password} onChange={onChange} required />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Age" name="age" type="number" value={form.age} onChange={onChange} />
                <TextField select label="Gender" name="gender" value={form.gender} onChange={onChange}>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Height (cm)" name="height" type="number" value={form.height} onChange={onChange} />
                <TextField label="Weight (kg)" name="weight" type="number" value={form.weight} onChange={onChange} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField select label="Goal" name="goal" value={form.goal} onChange={onChange}>
                  <MenuItem value="lose">Lose</MenuItem>
                  <MenuItem value="maintain">Maintain</MenuItem>
                  <MenuItem value="gain">Gain</MenuItem>
                </TextField>
                <TextField select label="Activity" name="activityLevel" value={form.activityLevel} onChange={onChange}>
                  <MenuItem value="sedentary">Sedentary</MenuItem>
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="moderate">Moderate</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="very_active">Very Active</MenuItem>
                </TextField>
              </Stack>
              <TextField select label="Dietary Preference" name="dietaryRestrictions" value={form.dietaryRestrictions[0]} onChange={(e) => setForm({ ...form, dietaryRestrictions: [e.target.value] })}>
                <MenuItem value="none">No restrictions</MenuItem>
                <MenuItem value="vegetarian">Vegetarian</MenuItem>
                <MenuItem value="vegan">Vegan</MenuItem>
                <MenuItem value="non-vegetarian">Non-vegetarian</MenuItem>
              </TextField>
              {error && <Typography color="error" variant="body2">{error}</Typography>}
              <Button variant="contained" type="submit" disabled={loading}>Create Account</Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Stack>
  )
}
