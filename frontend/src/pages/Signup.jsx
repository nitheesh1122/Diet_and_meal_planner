import React from 'react'
import { 
  Card, CardContent, Typography, TextField, Button, Stack, MenuItem, InputAdornment, 
  IconButton, Tooltip, Box, Paper, Chip, Grid, Container, Divider, Link
} from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import Logo from '../components/Logo'
import LoadingSpinner from '../components/LoadingSpinner'
import PrivacyTOSModal from '../components/PrivacyTOSModal'

export default function Signup() {
  const { signup, loading } = useAuth()
  const [progress, setProgress] = React.useState(0)
  const [form, setForm] = React.useState({
    name: '', 
    email: '', 
    password: '', 
    age: '', 
    phoneNumber: '',
    gender: '', 
    height: '', 
    weight: '', 
    weightLevel: '',
    goal: '', 
    activityLevel: '', 
    dietaryRestrictions: [],
    macroRatio: {
      protein: 30,
      carbs: 40,
      fats: 30
    }
  })
  const [error, setError] = React.useState('')
  const [passwordStrength, setPasswordStrength] = React.useState({ strength: '', color: 'default' })
  const [macroRatiosManuallyEdited, setMacroRatiosManuallyEdited] = React.useState(false)
  const [showPrivacyTOSModal, setShowPrivacyTOSModal] = React.useState(false)
  const navigate = useNavigate()

  // Simulate progress during loading
  React.useEffect(() => {
    if (loading) {
      setProgress(0)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 300)
      return () => clearInterval(interval)
    } else {
      setProgress(0)
    }
  }, [loading])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validate all required fields are filled
    const requiredFields = [
      { key: 'name', label: 'Full Name' },
      { key: 'email', label: 'Email' },
      { key: 'password', label: 'Password' },
      { key: 'age', label: 'Age' },
      { key: 'phoneNumber', label: 'Phone Number' },
      { key: 'gender', label: 'Gender' },
      { key: 'height', label: 'Height' },
      { key: 'weight', label: 'Weight' },
      { key: 'goal', label: 'Goal' },
      { key: 'activityLevel', label: 'Activity Level' },
    ]
    
    const missingFields = requiredFields.filter(field => {
      const value = form[field.key]
      return value === '' || value === null || value === undefined
    })
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`)
      return
    }
    
    // Validate dietary restrictions
    if (!form.dietaryRestrictions || form.dietaryRestrictions.length === 0) {
      setError('Please select a dietary preference')
      return
    }
    
    // Validate macro ratios are valid numbers
    const protein = Number(form.macroRatio.protein)
    const carbs = Number(form.macroRatio.carbs)
    const fats = Number(form.macroRatio.fats)
    
    if (isNaN(protein) || isNaN(carbs) || isNaN(fats)) {
      setError('Please enter valid numbers for all macro ratio fields')
      return
    }
    
    if (protein < 0 || carbs < 0 || fats < 0) {
      setError('Macro ratios cannot be negative')
      return
    }
    
    // Validate macro ratios sum to 100
    const total = protein + carbs + fats
    if (Math.abs(total - 100) > 0.1) {
      setError('Macro ratios must sum to exactly 100%')
      return
    }
    
    // Validate weight level is calculated (should be set by BMI calculation)
    if (!form.weightLevel) {
      setError('Please enter valid height and weight to calculate BMI')
      return
    }
    
    setProgress(0)
    const res = await signup(form)
    if (res.ok) {
      setProgress(100)
      // Show privacy/TOS modal before navigating
      setShowPrivacyTOSModal(true)
    } else {
      setError(res.message)
      setProgress(0)
    }
  }

  // Calculate password strength
  const checkPasswordStrength = (password) => {
    if (!password || password.length === 0) {
      return { strength: '', color: 'default' }
    }
    
    let strength = 0
    let feedback = []
    
    // Length check
    if (password.length >= 8) strength += 1
    else feedback.push('At least 8 characters')
    
    if (password.length >= 12) strength += 1
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength += 1
    else feedback.push('lowercase letter')
    
    if (/[A-Z]/.test(password)) strength += 1
    else feedback.push('uppercase letter')
    
    if (/[0-9]/.test(password)) strength += 1
    else feedback.push('number')
    
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1
    else feedback.push('special character')
    
    // Determine strength level
    if (strength <= 2) {
      return { strength: 'Weak', color: 'error', feedback }
    } else if (strength <= 4) {
      return { strength: 'Moderate', color: 'warning', feedback }
    } else {
      return { strength: 'Strong', color: 'success', feedback: [] }
    }
  }

  // Update password strength on password change
  React.useEffect(() => {
    setPasswordStrength(checkPasswordStrength(form.password))
  }, [form.password])

  // Calculate BMI and set weight level automatically
  React.useEffect(() => {
    if (form.height && form.weight && form.height > 0 && form.weight > 0) {
      // BMI = weight (kg) / (height (m))^2
      const heightInMeters = form.height / 100
      const bmi = form.weight / (heightInMeters * heightInMeters)
      
      let weightLevel = 'normal'
      if (bmi < 18.5) {
        weightLevel = 'underweight'
      } else if (bmi >= 18.5 && bmi < 25) {
        weightLevel = 'normal'
      } else if (bmi >= 25 && bmi < 30) {
        weightLevel = 'overweight'
      } else {
        weightLevel = 'obese'
      }
      
      setForm(prev => ({ ...prev, weightLevel }))
    } else {
      // Reset weight level if height or weight is empty
      setForm(prev => ({ ...prev, weightLevel: '' }))
    }
  }, [form.height, form.weight])

  const onChange = (e) => {
    if (e.target.name.startsWith('macroRatio.')) {
      const macroType = e.target.name.split('.')[1]
      const value = e.target.value === '' ? '' : (isNaN(parseFloat(e.target.value)) ? '' : parseFloat(e.target.value))
      setMacroRatiosManuallyEdited(true)
      setForm({ 
        ...form, 
        macroRatio: { 
          ...form.macroRatio, 
          [macroType]: value 
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

  const totalMacro = (Number(form.macroRatio.protein) || 0) + (Number(form.macroRatio.carbs) || 0) + (Number(form.macroRatio.fats) || 0)
  const macroError = form.macroRatio.protein !== '' && form.macroRatio.carbs !== '' && form.macroRatio.fats !== '' && Math.abs(totalMacro - 100) > 0.1

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

  // Calculate optimal macro ratios based on BMR, BMI, TDEE, and goal
  const calculateOptimalMacroRatios = () => {
    const bmr = calculateBMR()
    const tdee = calculateTDEE()
    if (!bmr || !tdee || !form.height || !form.weight || !form.goal || !form.weightLevel) {
      return null
    }
    
    // Calculate BMI
    const heightInMeters = form.height / 100
    const bmi = form.weight / (heightInMeters * heightInMeters)
    
    let proteinPct = 30  // Base protein percentage
    let carbsPct = 40     // Base carbs percentage
    let fatsPct = 30      // Base fats percentage
    
    // Adjust based on goal
    if (form.goal === 'lose') {
      // Higher protein for weight loss to preserve muscle
      proteinPct = 35
      carbsPct = 35
      fatsPct = 30
      
      // If overweight/obese, increase protein more
      if (form.weightLevel === 'overweight' || form.weightLevel === 'obese') {
        proteinPct = 40
        carbsPct = 30
        fatsPct = 30
      }
    } else if (form.goal === 'gain') {
      // Higher carbs for weight gain
      proteinPct = 30
      carbsPct = 45
      fatsPct = 25
      
      // If underweight, increase carbs more
      if (form.weightLevel === 'underweight') {
        proteinPct = 25
        carbsPct = 50
        fatsPct = 25
      }
    } else {
      // Maintain - balanced approach
      // Adjust based on BMI
      if (bmi < 18.5) {
        // Underweight - more carbs for energy
        proteinPct = 25
        carbsPct = 45
        fatsPct = 30
      } else if (bmi >= 25) {
        // Overweight - more protein
        proteinPct = 35
        carbsPct = 35
        fatsPct = 30
      } else {
        // Normal weight - balanced
        proteinPct = 30
        carbsPct = 40
        fatsPct = 30
      }
    }
    
    // Adjust based on activity level (more active = more carbs)
    if (form.activityLevel === 'active' || form.activityLevel === 'athlete') {
      carbsPct = Math.min(carbsPct + 5, 55)
      proteinPct = Math.max(proteinPct - 2, 25)
      fatsPct = 100 - carbsPct - proteinPct
    } else if (form.activityLevel === 'no_activity' || form.activityLevel === 'sedentary') {
      carbsPct = Math.max(carbsPct - 5, 30)
      proteinPct = Math.min(proteinPct + 2, 40)
      fatsPct = 100 - carbsPct - proteinPct
    }
    
    // Ensure they sum to 100
    const total = proteinPct + carbsPct + fatsPct
    if (Math.abs(total - 100) > 0.01) {
      const diff = 100 - total
      proteinPct += diff / 3
      carbsPct += diff / 3
      fatsPct += diff / 3
    }
    
    return {
      protein: Math.round(proteinPct),
      carbs: Math.round(carbsPct),
      fats: Math.round(fatsPct)
    }
  }

  // Auto-update macro ratios when relevant fields change (only if not manually edited)
  React.useEffect(() => {
    if (macroRatiosManuallyEdited) return // Don't auto-update if user has manually edited
    
    const optimalRatios = calculateOptimalMacroRatios()
    if (optimalRatios && form.height && form.weight && form.age && form.gender && form.goal && form.activityLevel && form.weightLevel) {
      setForm(prev => ({
        ...prev,
        macroRatio: optimalRatios
      }))
    }
  }, [form.height, form.weight, form.age, form.gender, form.goal, form.activityLevel, form.weightLevel, macroRatiosManuallyEdited])

  const bmr = calculateBMR()
  const tdee = calculateTDEE()
  const dailyCalories = calculateDailyCalories()
  const macros = calculateMacros()

  return (
    <Box sx={{ minHeight: '100vh', py: 4, bgcolor: 'background.default' }}>
      <LoadingSpinner loading={loading} progress={progress} />
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
                    <Box>
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
                      {form.password && (
                        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={`Password Strength: ${passwordStrength.strength}`}
                            color={passwordStrength.color}
                            size="small"
                            variant="outlined"
                          />
                          {passwordStrength.feedback && passwordStrength.feedback.length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              Add: {passwordStrength.feedback.slice(0, 2).join(', ')}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
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
                        required
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
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          <em>Select Gender</em>
                        </MenuItem>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </TextField>
                      <TextField 
                        select 
                        label="Weight Level (Auto-calculated from BMI)" 
                        name="weightLevel" 
                        value={form.weightLevel} 
                        onChange={onChange}
                        disabled
                        fullWidth
                        size="medium"
                        helperText="Calculated automatically based on your height and weight"
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
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          <em>Select Goal</em>
                        </MenuItem>
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
                        displayEmpty
                      >
                        <MenuItem value="" disabled>
                          <em>Select Activity Level</em>
                        </MenuItem>
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
                      value={form.dietaryRestrictions[0] || ''} 
                      onChange={(e) => setForm({ ...form, dietaryRestrictions: [e.target.value] })}
                      required
                      fullWidth
                      size="medium"
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        <em>Select Dietary Preference</em>
                      </MenuItem>
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
                          helperText={macroError ? 'Total must equal 100%' : 'Auto-calculated based on BMR, BMI, TDEE, and goal (editable)'}
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
      
      {/* Privacy & TOS Acceptance Modal */}
      <PrivacyTOSModal
        open={showPrivacyTOSModal}
        onAccept={() => {
          setShowPrivacyTOSModal(false)
          setTimeout(() => navigate('/'), 300)
        }}
        onDecline={() => {
          setShowPrivacyTOSModal(false)
          setError('You must accept the Privacy Policy and Terms of Service to use our service.')
        }}
      />
    </Box>
  )
}
