import React from 'react'
import {
  Grid, Card, CardContent, Typography, Stack, TextField, Button, Divider, Switch,
  FormControlLabel, MenuItem, Chip, LinearProgress, InputAdornment, Box, Paper
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { useAuth } from '../context/AuthContext'
import { useThemeMode } from '../context/ThemeModeContext'
import { useNotifications } from '../context/NotificationContext'
import { api } from '../utils/api'

const activityOptions = [
  { value: 'no_activity', label: 'No Activity' },
  { value: 'sedentary', label: 'Sedentary (Little exercise)' },
  { value: 'light_moderate', label: 'Light Moderate (1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (3-5 days/week)' },
  { value: 'active', label: 'Active (5-7 days/week)' },
  { value: 'athlete', label: 'Athlete (2x training a day)' }
]

export default function Settings() {
  const { user, setUser } = useAuth()
  const { mode, toggleMode } = useThemeMode()
  const { desktopEnabled, setDesktopEnabled } = useNotifications()
  const [profile, setProfile] = React.useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    age: user?.age || 25,
    gender: user?.gender || 'male',
    height: user?.height || 175,
    weight: user?.weight || 70
  }))
  const [goals, setGoals] = React.useState(() => ({
    goal: user?.goal || 'maintain',
    activityLevel: user?.activityLevel || 'moderate'
  }))
  const [preferences, setPreferences] = React.useState(() => ({
    dietaryRestrictions: user?.preferences?.dietaryRestrictions || ['none']
  }))
  const [macroRatio, setMacroRatio] = React.useState(() => ({
    protein: user?.macroRatio?.protein ?? 30,
    carbs: user?.macroRatio?.carbs ?? 40,
    fats: user?.macroRatio?.fats ?? 30
  }))
  const macroTotal = macroRatio.protein + macroRatio.carbs + macroRatio.fats
  const macroError = Math.abs(macroTotal - 100) > 0.1

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value })
  const handleGoalsChange = (e) => setGoals({ ...goals, [e.target.name]: e.target.value })
  const handlePreferencesChange = (e) => setPreferences({ ...preferences, [e.target.name]: [e.target.value] })
  const handleMacroChange = (name, value) => {
    setMacroRatio(prev => ({ ...prev, [name]: Math.max(0, Number(value) || 0) }))
  }

  const saveProfile = async () => {
    const updated = await api.updateProfile({ ...profile, macroRatio })
    setUser(updated)
  }

  const saveGoals = async () => {
    const updated = await api.updateGoals(goals)
    setUser(updated)
  }

  const savePreferences = async () => {
    const updated = await api.updatePreferences(preferences)
    setUser(updated)
  }

  const bmi = user?.bmi
  const weightLevel = user?.weightLevel

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Header Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
              Settings & Personalization
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Keep your profile, nutrition goals, and experience preferences up to date.
            </Typography>
          </Paper>
        </Grid>

      <Grid item xs={12} md={6}>
        <Card elevation={3}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={700}>Profile & Contact</Typography>
              <TextField label="Full name" name="name" value={profile.name} onChange={handleProfileChange} fullWidth />
              <TextField label="Email" name="email" value={profile.email} onChange={handleProfileChange} fullWidth />
              <TextField label="Phone number" name="phoneNumber" value={profile.phoneNumber} onChange={handleProfileChange} fullWidth />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Age" name="age" type="number" value={profile.age} onChange={handleProfileChange} fullWidth />
                <TextField select label="Gender" name="gender" value={profile.gender} onChange={handleProfileChange} fullWidth>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Height (cm)" name="height" type="number" value={profile.height} onChange={handleProfileChange} fullWidth />
                <TextField label="Weight (kg)" name="weight" type="number" value={profile.weight} onChange={handleProfileChange} fullWidth />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Chip label={`BMI ${bmi ?? '—'}`} color="info" />
                <Chip label={`Weight level: ${titleCase(weightLevel || 'normal')}`} color="default" />
              </Stack>
              <Button variant="contained" onClick={saveProfile} disabled={macroError}>Save Profile</Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card elevation={3}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={700}>Goals & Activity</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField select label="Primary goal" name="goal" value={goals.goal} onChange={handleGoalsChange} fullWidth>
                  <MenuItem value="lose">Lose weight</MenuItem>
                  <MenuItem value="maintain">Maintain weight</MenuItem>
                  <MenuItem value="gain">Gain weight</MenuItem>
                </TextField>
                <TextField select label="Activity level" name="activityLevel" value={goals.activityLevel} onChange={handleGoalsChange} fullWidth>
                  {activityOptions.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </TextField>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Goal and activity feed into your calorie target ({user?.dailyCalorieGoal || 0} kcal) and macro plan.
              </Typography>
              <Button variant="outlined" onClick={saveGoals}>Update goal & activity</Button>
              <Divider />
              <Typography variant="subtitle2" fontWeight={700}>Macro ratio</Typography>
              <Stack spacing={1}>
                {['protein','carbs','fats'].map(key => (
                  <TextField
                    key={key}
                    label={`${titleCase(key)} %`}
                    type="number"
                    value={macroRatio[key]}
                    onChange={e => handleMacroChange(key, e.target.value)}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  />
                ))}
                <Typography variant="body2" color={macroError ? 'error' : 'text.secondary'}>
                  Total: {macroTotal.toFixed(1)}% {macroError ? '(must be 100%)' : ''}
                </Typography>
                <LinearProgress variant="determinate" value={Math.min(100, macroTotal)} color={macroError ? 'error' : 'primary'} sx={{ height: 8, borderRadius: 1 }} />
              </Stack>
              <Button variant="contained" onClick={saveProfile} disabled={macroError}>Save macro plan</Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card elevation={3}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={700}>Diet & Notifications</Typography>
              <TextField select label="Dietary preference" name="dietaryRestrictions" value={preferences.dietaryRestrictions[0]} onChange={handlePreferencesChange} fullWidth>
                <MenuItem value="none">No restrictions</MenuItem>
                <MenuItem value="vegetarian">Vegetarian</MenuItem>
                <MenuItem value="vegan">Vegan</MenuItem>
                <MenuItem value="non-vegetarian">Non-vegetarian</MenuItem>
              </TextField>
              <Button variant="outlined" onClick={savePreferences}>Save dietary preference</Button>
              <Divider />
              <FormControlLabel control={<Switch checked={mode==='dark'} onChange={toggleMode} />} label={`Dark mode: ${mode==='dark' ? 'On' : 'Off'}`} />
              <FormControlLabel control={<Switch checked={desktopEnabled} onChange={(e)=> setDesktopEnabled(e.target.checked)} />} label={`Desktop notifications: ${desktopEnabled ? 'Enabled' : 'Disabled'}`} />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <InfoOutlinedIcon fontSize="small" /> Enable notifications to receive grocery reminders and plan nudges.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      </Grid>
    </Box>
  )
}

function titleCase(str) {
  return String(str || '')
    .split(/[_\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
