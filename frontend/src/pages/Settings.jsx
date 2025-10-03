import React from 'react'
import { Card, CardContent, Typography, Stack, TextField, Button, Divider, Switch, FormControlLabel, MenuItem } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { useThemeMode } from '../context/ThemeModeContext'
import { useNotifications } from '../context/NotificationContext'
import { api } from '../utils/api'

export default function Settings() {
  const { user, setUser } = useAuth()
  const { mode, toggleMode } = useThemeMode()
  const { desktopEnabled, setDesktopEnabled } = useNotifications()
  const [form, setForm] = React.useState(() => ({
    name: user?.name || '', email: user?.email || '', age: user?.age || 25, gender: user?.gender || 'male', height: user?.height || 175, weight: user?.weight || 70
  }))
  const [goals, setGoals] = React.useState(() => ({ goal: user?.goal || 'maintain', activityLevel: user?.activityLevel || 'moderate' }))
  const [preferences, setPreferences] = React.useState(() => ({
    dietaryRestrictions: user?.preferences?.dietaryRestrictions || ['none']
  }))

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const onGoalsChange = (e) => setGoals({ ...goals, [e.target.name]: e.target.value })
  const onPreferencesChange = (e) => setPreferences({ ...preferences, [e.target.name]: [e.target.value] })

  const onSave = async () => {
    const updated = await api.updateProfile(form)
    setUser(updated)
  }

  const onSaveGoals = async () => {
    const updated = await api.updateGoals(goals)
    setUser(updated)
  }

  const onSavePreferences = async () => {
    const updated = await api.updatePreferences(preferences)
    setUser(updated)
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Settings</Typography>
        <Stack spacing={2}>
          <Typography variant="subtitle2" color="text.secondary">Preferences</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <FormControlLabel control={<Switch checked={mode==='dark'} onChange={toggleMode} />} label={`Dark Mode: ${mode==='dark' ? 'On' : 'Off'}`} />
            <FormControlLabel control={<Switch checked={desktopEnabled} onChange={(e)=> setDesktopEnabled(e.target.checked)} />} label={`Desktop Notifications: ${desktopEnabled ? 'On' : 'Off'}`} />
          </Stack>
          <Divider />
          <Typography variant="subtitle2" color="text.secondary">Dietary Preferences</Typography>
          <TextField select label="Dietary Preference" name="dietaryRestrictions" value={preferences.dietaryRestrictions[0]} onChange={onPreferencesChange} sx={{ maxWidth: 300 }}>
            <MenuItem value="none">No restrictions</MenuItem>
            <MenuItem value="vegetarian">Vegetarian</MenuItem>
            <MenuItem value="vegan">Vegan</MenuItem>
            <MenuItem value="non-vegetarian">Non-vegetarian</MenuItem>
          </TextField>
          <Button variant="contained" color="secondary" onClick={onSavePreferences}>Save Preferences</Button>
          <Divider />
          <Typography variant="subtitle2" color="text.secondary">Goals</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Goal" name="goal" value={goals.goal} onChange={onGoalsChange} sx={{ minWidth: 200 }}>
              <MenuItem value="lose">Lose weight</MenuItem>
              <MenuItem value="maintain">Maintain weight</MenuItem>
              <MenuItem value="gain">Gain weight</MenuItem>
            </TextField>
            <TextField select label="Activity level" name="activityLevel" value={goals.activityLevel} onChange={onGoalsChange} sx={{ minWidth: 240 }}>
              <MenuItem value="sedentary">Sedentary</MenuItem>
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="moderate">Moderate</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="very_active">Very active</MenuItem>
            </TextField>
          </Stack>
          <Button variant="contained" color="secondary" onClick={onSaveGoals}>Save Goals</Button>
          <Divider />
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
