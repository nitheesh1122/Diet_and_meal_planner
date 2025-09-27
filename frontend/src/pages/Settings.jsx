import React from 'react'
import { Card, CardContent, Typography, Stack, TextField, Button } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

export default function Settings() {
  const { user, setUser } = useAuth()
  const [form, setForm] = React.useState(() => ({
    name: user?.name || '', email: user?.email || '', age: user?.age || 25, gender: user?.gender || 'male', height: user?.height || 175, weight: user?.weight || 70
  }))

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSave = async () => {
    const updated = await api.updateProfile(form)
    setUser(updated)
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Settings</Typography>
        <Stack spacing={2}>
          <TextField label="Name" name="name" value={form.name} onChange={onChange} />
          <TextField label="Email" name="email" value={form.email} onChange={onChange} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Age" name="age" type="number" value={form.age} onChange={onChange} />
            <TextField label="Height (cm)" name="height" type="number" value={form.height} onChange={onChange} />
            <TextField label="Weight (kg)" name="weight" type="number" value={form.weight} onChange={onChange} />
          </Stack>
          <Button variant="contained" onClick={onSave}>Save</Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
