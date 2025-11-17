import React from 'react'
import { 
  Card, CardContent, Typography, TextField, Button, Stack, MenuItem, InputAdornment, 
  IconButton, Tooltip, Box, Paper, Chip, Grid, Container, Divider, Link
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import Logo from '../components/Logo'

export default function Signup() {
  const { signup, loading } = useAuth()
  const [form, setForm] = React.useState({
    name: '', 
    email: '', 
    password: '', 
    age: 25, 
    phoneNumber: '',
    gender: 'male', 
    height: 175, 
    weight: 70, 
    weightLevel: 'normal',
    goal: 'maintain', 
    activityLevel: 'moderate', 
    dietaryRestrictions: ['none'],
    macroRatio: {
      protein: 30,
      carbs: 40,
      fats: 30
    }
  })
  const [error, setError] = React.useState('')
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    
    // Validate macro ratios sum to 100
    const total = form.macroRatio.protein + form.macroRatio.carbs + form.macroRatio.fats
    if (Math.abs(total - 100) > 0.1) {
      setError('Macro ratios must sum to 100%')
      return
    }
    
    const res = await signup(form)
    if (res.ok) navigate('/')
    else setError(res.message)
  }

  const onChange = (e) => {
    if (e.target.name.startsWith('macroRatio.')) {
      const macroType = e.target.name.split('.')[1]
      setForm({ 
        ...form, 
        macroRatio: { 
          ...form.macroRatio, 
          [macroType]: parseFloat(e.target.value) || 0 
        } 
      })
    } else {
      const value = e.target.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
      setForm({ ...form, [e.target.name]: value })
    }
  }
  
  const macroInfoTooltip = (
    <Tooltip 
      title={
        <Box sx={{ p: 1 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
            Macro Ratio Percentage
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            These percentages determine how your daily calories are distributed among macronutrients:
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            • <strong>Protein:</strong> Essential for muscle repair and growth (4 calories per gram)
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            • <strong>Carbs:</strong> Primary energy source (4 calories per gram)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            • <strong>Fats:</strong> Important for hormone production and nutrient absorption (9 calories per gram)
          </Typography>
          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
            <strong>Note:</strong> The three percentages must add up to exactly 100%. 
            Common ratios: 30% protein, 40% carbs, 30% fats (balanced) or 40% protein, 30% carbs, 30% fats (high protein).
          </Typography>
        </Box>
      }
      arrow
      placement="right"
    >
      <IconButton size="small" sx={{ ml: 0.5 }}>
        <InfoIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  )

  const totalMacro = form.macroRatio.protein + form.macroRatio.carbs + form.macroRatio.fats
  const macroError = Math.abs(totalMacro - 100) > 0.1

  // Calculate BMR and TDEE in real-time
  const calculateBMR = () => {
    if (!form.age || !form.height || !form.weight || !form.gender) return null
    
    let bmr
    if (form.gender === 'male') {
      bmr = 10 * form.weight + 6.25 * form.height - 5 * form.age + 5
    } else {
      bmr = 10 * form.weight + 6.25 * form.height - 5 * form.age - 161
    }
    return Math.round(bmr)
  }

  const calculateTDEE = () => {
    const bmr = calculateBMR()
    if (!bmr || !form.activityLevel) return null
    
    const activityMultipliers = {
      no_activity: 1.2,
      sedentary: 1.2,
      light_moderate: 1.375,
      moderate: 1.55,
      active: 1.725,
      athlete: 1.9
    }
    
    const tdee = bmr * (activityMultipliers[form.activityLevel] || 1.55)
    return Math.round(tdee)
  }

  const calculateDailyCalories = () => {
    const tdee = calculateTDEE()
    if (!tdee || !form.goal) return null
    
    const goalMultipliers = {
      lose: 0.85,  // 15% calorie deficit
      maintain: 1,
      gain: 1.15   // 15% calorie surplus
    }
    
    const dailyCalories = Math.round(tdee * (goalMultipliers[form.goal] || 1))
    return dailyCalories
  }

  const calculateMacros = () => {
    const dailyCalories = calculateDailyCalories()
    if (!dailyCalories) return null
    
    const proteinPct = (form.macroRatio?.protein || 30) / 100
    const carbsPct = (form.macroRatio?.carbs || 40) / 100
    const fatsPct = (form.macroRatio?.fats || 30) / 100
    
    return {
      protein: Math.round((dailyCalories * proteinPct) / 4), // 4 cal/g protein
      carbs: Math.round((dailyCalories * carbsPct) / 4),   // 4 cal/g carbs
      fat: Math.round((dailyCalories * fatsPct) / 9)      // 9 cal/g fat
    }
  }

  const bmr = calculateBMR()
  const tdee = calculateTDEE()
  const dailyCalories = calculateDailyCalories()
  const macros = calculateMacros()

  return (
    <Box sx={{ minHeight: '100vh', py: 4, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Header Section */}
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Stack spacing={2} alignItems="center">
                <Box sx={{ mb: 1 }}>
                  <Logo variant="full" size="medium" />
                </Box>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
                  Create Your Account 🚀
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, textAlign: 'center' }}>
                  Get personalized meal plans based on your unique nutrition needs
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* Signup Form */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                  Personal Information
                </Typography>
          <form onSubmit={onSubmit}>
                  <Stack spacing={3}>
                    <TextField 
                      label="Full Name" 
                      name="name" 
                      value={form.name} 
                      onChange={onChange} 
                      required 
                      fullWidth
                      size="medium"
                    />
                    <TextField 
                      label="Email" 
                      name="email" 
                      type="email" 
                      value={form.email} 
                      onChange={onChange} 
                      required 
                      fullWidth
                      size="medium"
                    />
                    <TextField 
                      label="Password" 
                      name="password" 
                      type="password" 
                      value={form.password} 
                      onChange={onChange} 
                      required 
                      fullWidth
                      size="medium"
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField 
                        label="Age" 
                        name="age" 
                        type="number" 
                        value={form.age} 
                        onChange={onChange}
                        inputProps={{ min: 13, max: 120 }}
                        required
                        fullWidth
                        size="medium"
                      />
                      <TextField 
                        label="Phone Number" 
                        name="phoneNumber" 
                        type="tel" 
                        value={form.phoneNumber} 
                        onChange={onChange}
                        placeholder="+1234567890"
                        fullWidth
                        size="medium"
                      />
                    </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField 
                        select 
                        label="Gender" 
                        name="gender" 
                        value={form.gender} 
                        onChange={onChange}
                        required
                        fullWidth
                        size="medium"
                      >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
                      <TextField 
                        select 
                        label="Weight Level" 
                        name="weightLevel" 
                        value={form.weightLevel} 
                        onChange={onChange}
                        fullWidth
                        size="medium"
                      >
                        <MenuItem value="underweight">Underweight</MenuItem>
                        <MenuItem value="normal">Normal</MenuItem>
                        <MenuItem value="overweight">Overweight</MenuItem>
                        <MenuItem value="obese">Obese</MenuItem>
                      </TextField>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField 
                        label="Height (cm)" 
                        name="height" 
                        type="number" 
                        value={form.height} 
                        onChange={onChange}
                        inputProps={{ min: 100, max: 300 }}
                        required
                        fullWidth
                        size="medium"
                      />
                      <TextField 
                        label="Weight (kg)" 
                        name="weight" 
                        type="number" 
                        value={form.weight} 
                        onChange={onChange}
                        inputProps={{ min: 20, max: 300 }}
                        required
                        fullWidth
                        size="medium"
                      />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField 
                        select 
                        label="Goal" 
                        name="goal" 
                        value={form.goal} 
                        onChange={onChange}
                        required
                        fullWidth
                        size="medium"
                      >
                        <MenuItem value="lose">Lose Weight</MenuItem>
                        <MenuItem value="maintain">Maintain Weight</MenuItem>
                        <MenuItem value="gain">Gain Weight</MenuItem>
                </TextField>
                      <TextField 
                        select 
                        label="Activity Level" 
                        name="activityLevel" 
                        value={form.activityLevel} 
                        onChange={onChange}
                        required
                        fullWidth
                        size="medium"
                      >
                        <MenuItem value="no_activity">No Activity</MenuItem>
                        <MenuItem value="sedentary">Sedentary (Little Exercise)</MenuItem>
                        <MenuItem value="light_moderate">Light Moderate (1-3 days/week)</MenuItem>
                        <MenuItem value="moderate">Moderate (3-5 days/week)</MenuItem>
                        <MenuItem value="active">Active (5-7 days/week)</MenuItem>
                        <MenuItem value="athlete">Athlete (2x training a day)</MenuItem>
                </TextField>
              </Stack>
                    <TextField 
                      select 
                      label="Dietary Preference" 
                      name="dietaryRestrictions" 
                      value={form.dietaryRestrictions[0]} 
                      onChange={(e) => setForm({ ...form, dietaryRestrictions: [e.target.value] })}
                      fullWidth
                      size="medium"
                    >
                <MenuItem value="none">No restrictions</MenuItem>
                <MenuItem value="vegetarian">Vegetarian</MenuItem>
                <MenuItem value="vegan">Vegan</MenuItem>
                <MenuItem value="non-vegetarian">Non-vegetarian</MenuItem>
              </TextField>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {/* Macro Ratio Section */}
                    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3, bgcolor: 'action.hover' }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Macro Ratio Percentage
                        </Typography>
                        {macroInfoTooltip}
                      </Stack>
                      <Stack spacing={2}>
                        <TextField
                          label="Protein (%)"
                          name="macroRatio.protein"
                          type="number"
                          value={form.macroRatio.protein}
                          onChange={onChange}
                          inputProps={{ min: 0, max: 100, step: 0.1 }}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                          }}
                          error={macroError}
                          helperText={macroError ? 'Total must equal 100%' : ''}
                          fullWidth
                          size="medium"
                        />
                        <TextField
                          label="Carbs (%)"
                          name="macroRatio.carbs"
                          type="number"
                          value={form.macroRatio.carbs}
                          onChange={onChange}
                          inputProps={{ min: 0, max: 100, step: 0.1 }}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                          }}
                          error={macroError}
                          fullWidth
                          size="medium"
                        />
                        <TextField
                          label="Fats (%)"
                          name="macroRatio.fats"
                          type="number"
                          value={form.macroRatio.fats}
                          onChange={onChange}
                          inputProps={{ min: 0, max: 100, step: 0.1 }}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>
                          }}
                          error={macroError}
                          fullWidth
                          size="medium"
                        />
                        <Typography 
                          variant="body2" 
                          color={macroError ? 'error' : 'text.secondary'}
                          sx={{ textAlign: 'center', fontWeight: macroError ? 'bold' : 'normal' }}
                        >
                          Total: {totalMacro.toFixed(1)}% {macroError && '(Must be 100%)'}
                        </Typography>
                      </Stack>
                    </Box>

                    {/* Personalized Nutrition Goals Preview */}
                    {(bmr || tdee || dailyCalories) && (
                      <Paper 
                        elevation={2} 
                        sx={{ 
                          p: 3, 
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                          border: '2px solid',
                          borderColor: 'primary.main',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                          Your Personalized Nutrition Goals
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                          Based on your profile, here are your calculated values:
                        </Typography>
                        <Grid container spacing={2}>
                          {bmr && (
                            <Grid item xs={12} sm={4}>
                              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                                <Typography variant="caption" color="text.secondary">BMR</Typography>
                                <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>{bmr} kcal/day</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Basal Metabolic Rate
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          {tdee && (
                            <Grid item xs={12} sm={4}>
                              <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: 1, borderColor: 'divider' }}>
                                <Typography variant="caption" color="text.secondary">TDEE</Typography>
                                <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>{tdee} kcal/day</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Total Daily Energy Expenditure
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          {dailyCalories && (
                            <Grid item xs={12} sm={4}>
                              <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 2, border: 1, borderColor: 'success.main' }}>
                                <Typography variant="caption" color="text.secondary">Daily Goal</Typography>
                                <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5, color: 'success.main' }}>
                                  {dailyCalories} kcal/day
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {form.goal === 'lose' ? 'Weight loss' : form.goal === 'gain' ? 'Weight gain' : 'Maintenance'}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                        {macros && (
                          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Typography variant="body2" fontWeight={600} gutterBottom>Daily Macro Goals:</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                              <Chip label={`Protein: ${macros.protein}g`} color="success" size="small" />
                              <Chip label={`Carbs: ${macros.carbs}g`} color="primary" size="small" />
                              <Chip label={`Fat: ${macros.fat}g`} color="warning" size="small" />
                            </Stack>
                          </Box>
                        )}
                      </Paper>
                    )}
                    
                    {error && (
                      <Box sx={{ p: 2, bgcolor: 'error.50', borderRadius: 1, border: 1, borderColor: 'error.main' }}>
                        <Typography color="error" variant="body2">{error}</Typography>
                      </Box>
                    )}
                    <Button 
                      variant="contained" 
                      type="submit" 
                      disabled={loading || macroError} 
                      fullWidth
                      size="large"
                      sx={{ 
                        py: 1.5,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                        },
                        '&:disabled': {
                          background: 'action.disabledBackground'
                        }
                      }}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                    <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                      Already have an account?{' '}
                      <Link 
                        component={RouterLink} 
                        to="/login"
                        sx={{ 
                          fontWeight: 600,
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        Sign in here
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
