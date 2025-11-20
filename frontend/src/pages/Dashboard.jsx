import React from 'react'
import {
  Grid, Card, CardContent, Typography, Stack, Box, Paper, Button, Chip, IconButton,
  LinearProgress, ToggleButtonGroup, ToggleButton, Divider, List, ListItem, ListItemText,
  ListItemIcon, Avatar, Tooltip, CircularProgress
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ReferenceLine
} from 'recharts'
import AddIcon from '@mui/icons-material/Add'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'
import MacroDonut from '../components/MacroDonut'
import Checkbox from '@mui/material/Checkbox'

const COLORS = ['#22C55E', '#3B82F6', '#F59E0B'] // Protein, Carbs, Fat

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { scheduleReminder, addNotification, toISTDate } = useNotifications()
  const [today, setToday] = React.useState(null)
  const [weekData, setWeekData] = React.useState([])
  const [timeRange, setTimeRange] = React.useState('7d')
  const [hydrationMl, setHydrationMl] = React.useState(() => {
    const k = `hydration_${new Date().toISOString().slice(0,10)}`
    return Number(localStorage.getItem(k) || 0)
  })
  const [loading, setLoading] = React.useState(false)
  
  // Manual meal completion state
  const todayKey = React.useMemo(() => `meal_completion_${new Date().toISOString().slice(0,10)}`, [])
  const [mealCompletionState, setMealCompletionState] = React.useState(() => {
    try {
      const stored = localStorage.getItem(todayKey)
      return stored ? JSON.parse(stored) : { breakfast: false, lunch: false, dinner: false, snacks: false }
    } catch {
      return { breakfast: false, lunch: false, dinner: false, snacks: false }
    }
  })

  React.useEffect(() => {
    localStorage.setItem(todayKey, JSON.stringify(mealCompletionState))
  }, [mealCompletionState, todayKey])

  const hydrationKey = React.useMemo(() => `hydration_${new Date().toISOString().slice(0,10)}`, [])
  React.useEffect(() => { localStorage.setItem(hydrationKey, String(hydrationMl)) }, [hydrationMl, hydrationKey])

  const load = React.useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
    const todayStr = new Date().toISOString().slice(0,10)
    const data = await api.getMeals(user._id, todayStr)
    setToday(data)
      
      // Load week data for trends
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 7
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      const endDate = new Date()
      const rangeData = await api.getMealsRange(user._id, startDate.toISOString().slice(0,10), endDate.toISOString().slice(0,10))
      setWeekData(rangeData || [])
    } finally {
      setLoading(false)
    }
  }, [user, timeRange])

  React.useEffect(() => { if (user) load() }, [user, load])
  React.useEffect(() => {
    const handler = () => { load() }
    window.addEventListener('plan-updated', handler)
    return () => window.removeEventListener('plan-updated', handler)
  }, [load])

  // Schedule meal reminders
  React.useEffect(() => {
    if (!user) return
    
    const scheduleMealReminders = () => {
      const istNow = toISTDate(new Date())
      const todayStr = istNow.toISOString().slice(0, 10)
      
      // Schedule reminders for each meal type
      Object.entries(mealReminderTimes).forEach(([type, time]) => {
        const reminderTime = new Date(istNow)
        reminderTime.setHours(time.hour, time.minute, 0, 0)
        
        // If time has passed today, schedule for tomorrow
        if (reminderTime <= istNow) {
          reminderTime.setDate(reminderTime.getDate() + 1)
        }
        
        // Check if reminder already scheduled for today
        const reminderKey = `meal_reminder_${type}_${todayStr}`
        if (!localStorage.getItem(reminderKey)) {
          scheduleReminder({
            itemId: `meal_${type}`,
            title: `Time for ${mealLabels[mealTypes.indexOf(type)]}! Don't forget to log your meal.`,
            whenIST: reminderTime
          })
          localStorage.setItem(reminderKey, 'scheduled')
        }
      })
      
      // Schedule evening snacks reminder (5:30 PM)
      const eveningSnacksDate = new Date(istNow)
      eveningSnacksDate.setHours(eveningSnacksTime.hour, eveningSnacksTime.minute, 0, 0)
      if (eveningSnacksDate <= istNow) {
        eveningSnacksDate.setDate(eveningSnacksDate.getDate() + 1)
      }
      const eveningKey = `meal_reminder_evening_snacks_${todayStr}`
      if (!localStorage.getItem(eveningKey)) {
        scheduleReminder({
          itemId: 'meal_evening_snacks',
          title: 'Evening Snacks Time! (5:30 PM) - Don\'t forget to log your snacks.',
          whenIST: eveningSnacksDate
        })
        localStorage.setItem(eveningKey, 'scheduled')
      }
    }
    
    scheduleMealReminders()
    
    // Clear reminder flags at midnight
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const msUntilMidnight = tomorrow.getTime() - now.getTime()
    
    const midnightTimer = setTimeout(() => {
      // Clear all reminder flags
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('meal_reminder_')) {
          localStorage.removeItem(key)
        }
      })
    }, msUntilMidnight)
    
    return () => clearTimeout(midnightTimer)
  }, [user, scheduleReminder, toISTDate])

  // Goal values
  const goal = user?.dailyCalorieGoal || 2000
  const gp = user?.dailyProteinGoal || 0
  const gc = user?.dailyCarbsGoal || 0
  const gf = user?.dailyFatGoal || 0

  // Hydration
  const hydrationGoal = user?.dailyWaterMl || 2000
  const hydrationPct = Math.min(100, Math.round((hydrationMl / hydrationGoal) * 100))
  const addWater250 = () => setHydrationMl((v) => Math.min(hydrationGoal, v + 250))

  // Meal completion tracking - manual
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks']
  const mealLabels = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
  const mealIcons = ['🌅', '☀️', '🌙', '🍎']
  const mealReminderTimes = {
    breakfast: { hour: 9, minute: 0 },
    snacks: { hour: 11, minute: 0 }, // Morning snacks
    lunch: { hour: 14, minute: 0 },
    dinner: { hour: 20, minute: 0 }
  }
  const eveningSnacksTime = { hour: 17, minute: 30 } // Evening snacks at 5:30 PM
  
  const mealCompletion = mealTypes.map(type => ({
    type,
    label: mealLabels[mealTypes.indexOf(type)],
    icon: mealIcons[mealTypes.indexOf(type)],
    completed: mealCompletionState[type] || false
  }))
  const completedMeals = mealCompletion.filter(m => m.completed).length

  // Toggle meal completion
  const toggleMealCompletion = (type) => {
    setMealCompletionState(prev => ({ ...prev, [type]: !prev[type] }))
  }

  // Calculate totals only from completed meals
  const calculateCompletedMealTotals = () => {
    if (!today) return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    
    let totalCal = 0, totalProt = 0, totalCarbs = 0, totalFat = 0
    
    mealTypes.forEach(type => {
      if (mealCompletionState[type] && today.meals?.[type]) {
        today.meals[type].forEach(meal => {
          totalCal += meal.calories || 0
          totalProt += meal.protein || 0
          totalCarbs += meal.carbs || 0
          totalFat += meal.fat || 0
        })
      }
    })
    
    return { calories: totalCal, protein: totalProt, carbs: totalCarbs, fat: totalFat }
  }

  const completedTotals = calculateCompletedMealTotals()
  
  // Calculate totals only from completed meals
  const total = completedTotals.calories
  const tp = completedTotals.protein
  const tc = completedTotals.carbs
  const tf = completedTotals.fat
  
  // Calculate remaining values
  const rem = Math.max(0, goal - total)
  const pct = Math.min(100, Math.round((total / goal) * 100))
  const protRem = Math.max(0, gp - tp)
  const carbRem = Math.max(0, gc - tc)
  const fatRem = Math.max(0, gf - tf)

  // Weekly summary
  const weeklySummary = React.useMemo(() => {
    if (!weekData.length) return null
    
    const totals = weekData.map(day => ({
      date: day.date,
      calories: day.totalCalories || 0,
      protein: day.totalProtein || 0,
      carbs: day.totalCarbs || 0,
      fat: day.totalFat || 0
    }))

    const avgCalories = totals.reduce((sum, d) => sum + d.calories, 0) / totals.length
    const avgProtein = totals.reduce((sum, d) => sum + d.protein, 0) / totals.length
    const avgCarbs = totals.reduce((sum, d) => sum + d.carbs, 0) / totals.length
    const avgFat = totals.reduce((sum, d) => sum + d.fat, 0) / totals.length

    const bestDay = totals.reduce((best, day) => 
      Math.abs(day.calories - goal) < Math.abs(best.calories - goal) ? day : best, totals[0] || {})
    const worstDay = totals.reduce((worst, day) => 
      Math.abs(day.calories - goal) > Math.abs(worst.calories - goal) ? day : worst, totals[0] || {})

    return {
      avgCalories: Math.round(avgCalories),
      avgProtein: Math.round(avgProtein),
      avgCarbs: Math.round(avgCarbs),
      avgFat: Math.round(avgFat),
      bestDay,
      worstDay,
      days: totals.length
    }
  }, [weekData, goal])

  // Adherence calculation
  const adherence = React.useMemo(() => {
    if (!weekData.length) return { percentage: 0, streak: 0, days: [] }
    
    const tol = 0.10 // ±10%
    const days = weekData.map(day => ({
      date: day.date,
      calories: day.totalCalories || 0,
      withinGoal: Math.abs((day.totalCalories || 0) - goal) <= goal * tol
    }))

    const within = days.filter(d => d.withinGoal).length
    const percentage = Math.round((within / days.length) * 100)

    // Calculate streak
    let streak = 0
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].withinGoal) streak++
      else break
    }

    return { percentage, streak, days }
  }, [weekData, goal])

  // Trend data for chart
  const trendData = React.useMemo(() => {
    return weekData.map(day => ({
      day: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      kcal: day.totalCalories || 0
    }))
  }, [weekData])

  // Generate insights
  const insights = React.useMemo(() => {
    const ins = []
    
    if (rem > 200) {
      ins.push({
        type: 'info',
        message: `You're ${rem} calories under your goal. Consider adding a healthy snack!`,
        action: () => navigate('/planner')
      })
    } else if (total > goal * 1.1) {
      ins.push({
        type: 'warning',
        message: `You've exceeded your calorie goal by ${Math.round(total - goal)} calories.`,
        action: null
      })
    }

    if (tp < gp * 0.8) {
      ins.push({
        type: 'info',
        message: `Your protein intake is low (${Math.round(tp)}g / ${gp}g). Add protein-rich foods!`,
        action: () => navigate('/planner')
      })
    }

    if (hydrationPct < 50) {
      ins.push({
        type: 'info',
        message: `You're only ${hydrationPct}% hydrated. Drink more water!`,
        action: addWater250
      })
    }

    if (adherence.streak >= 3) {
      ins.push({
        type: 'success',
        message: `Great job! You've been consistent for ${adherence.streak} days in a row! 🔥`,
        action: null
      })
    }

    if (completedMeals === 4) {
      ins.push({
        type: 'success',
        message: `Perfect! You've completed all meals for today! 🎉`,
        action: null
      })
    }

    return ins
  }, [rem, total, goal, tp, gp, hydrationPct, adherence.streak, completedMeals, navigate])

  // Quick stats
  const quickStats = React.useMemo(() => {
    const totalMeals = weekData.reduce((sum, day) => {
      return sum + mealTypes.reduce((acc, type) => acc + (day.meals?.[type]?.length || 0), 0)
    }, 0)

    // Most consumed category (simplified)
    const categories = {}
    weekData.forEach(day => {
      mealTypes.forEach(type => {
        (day.meals?.[type] || []).forEach(item => {
          const cat = item.food?.category || 'other'
          categories[cat] = (categories[cat] || 0) + 1
        })
      })
    })
    const favoriteCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    return {
      totalMeals,
      favoriteCategory: favoriteCategory.charAt(0).toUpperCase() + favoriteCategory.slice(1),
      avgMealsPerDay: weekData.length > 0 ? Math.round(totalMeals / weekData.length) : 0
    }
  }, [weekData, mealTypes])

  // Recent activity (mock for now)
  const recentActivity = React.useMemo(() => {
    const activities = []
    if (today && completedMeals > 0) {
      activities.push({
        type: 'meal',
        message: `Completed ${completedMeals} meal${completedMeals > 1 ? 's' : ''} today`,
        time: 'Today'
      })
    }
    if (weekData.length > 0) {
      activities.push({
        type: 'plan',
        message: `Generated meal plan for ${weekData.length} day${weekData.length > 1 ? 's' : ''}`,
        time: 'This week'
      })
    }
    return activities.slice(0, 5)
  }, [today, completedMeals, weekData.length])

  return (
    <Box>
    <Grid container spacing={3}>
        {/* Header Section */}
      <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
              Welcome{user?.name ? `, ${user.name}` : ''} 👋
            </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Your daily overview, macros, and upcoming meals at a glance.
            </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/planner')}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                >
                  Add Meal
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/planner')}
                  sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white' } }}
                >
                  View Planner
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* Enhanced KPI Cards with Circular Progress */}
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="caption" color="text.secondary">Calories</Typography>
                <Tooltip title="Shows your daily calorie intake vs. your goal. The circular progress indicates how close you are to meeting your daily calorie target. Green means on track, yellow means close, and red means over goal." arrow>
                  <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={pct}
                    size={80}
                    thickness={4}
                    sx={{ color: pct > 100 ? 'error.main' : pct > 80 ? 'warning.main' : 'success.main' }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" fontWeight={700}>{pct}%</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight={800}>{total} / {goal}</Typography>
                  <Typography variant="body2" color="text.secondary">Remaining: {rem} kcal</Typography>
                  <Button size="small" variant="text" startIcon={<AddIcon />} onClick={() => navigate('/planner')} sx={{ mt: 0.5 }}>
                    Add Snack
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="caption" color="text.secondary">Protein</Typography>
                <Tooltip title="Tracks your protein intake in grams. Protein is essential for muscle repair and growth. The circular progress shows how much of your daily protein goal you've consumed." arrow>
                  <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={gp ? Math.min(100, Math.round((tp/gp)*100)) : 0}
                    size={80}
                    thickness={4}
                    color="success"
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" fontWeight={700}>{gp ? Math.round((tp/gp)*100) : 0}%</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight={800}>{tp} / {gp}g</Typography>
                  <Typography variant="body2" color="text.secondary">Remaining: {protRem}g</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="caption" color="text.secondary">Carbs</Typography>
                <Tooltip title="Monitors your carbohydrate intake in grams. Carbs provide energy for your body. The progress indicator shows how much of your daily carb goal you've consumed." arrow>
                  <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={gc ? Math.min(100, Math.round((tc/gc)*100)) : 0}
                    size={80}
                    thickness={4}
                    color="primary"
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" fontWeight={700}>{gc ? Math.round((tc/gc)*100) : 0}%</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight={800}>{tc} / {gc}g</Typography>
                  <Typography variant="body2" color="text.secondary">Remaining: {carbRem}g</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="caption" color="text.secondary">Fat</Typography>
                <Tooltip title="Tracks your fat intake in grams. Healthy fats are important for hormone production and nutrient absorption. The progress shows how much of your daily fat goal you've consumed." arrow>
                  <InfoOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={gf ? Math.min(100, Math.round((tf/gf)*100)) : 0}
                    size={80}
                    thickness={4}
                    color="warning"
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" fontWeight={700}>{gf ? Math.round((tf/gf)*100) : 0}%</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight={800}>{tf} / {gf}g</Typography>
                  <Typography variant="body2" color="text.secondary">Remaining: {fatRem}g</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Macro Summary Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" fontWeight={700}>Macro Summary</Typography>
                <Tooltip title="Combined view of all three macronutrients (Protein, Carbs, Fat) with individual progress bars. Shows your total calorie intake and how it compares to your daily goal." arrow>
                  <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              </Stack>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={800} color="success.main">{tp}g</Typography>
                    <Typography variant="caption" color="text.secondary">Protein</Typography>
                    <LinearProgress variant="determinate" value={gp ? Math.min(100, (tp/gp)*100) : 0} color="success" sx={{ mt: 1, height: 6 }} />
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={800} color="primary.main">{tc}g</Typography>
                    <Typography variant="caption" color="text.secondary">Carbs</Typography>
                    <LinearProgress variant="determinate" value={gc ? Math.min(100, (tc/gc)*100) : 0} color="primary" sx={{ mt: 1, height: 6 }} />
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={800} color="warning.main">{tf}g</Typography>
                    <Typography variant="caption" color="text.secondary">Fat</Typography>
                    <LinearProgress variant="determinate" value={gf ? Math.min(100, (tf/gf)*100) : 0} color="warning" sx={{ mt: 1, height: 6 }} />
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Total Calories</Typography>
                  <Typography variant="h6" fontWeight={700}>{total} / {goal} kcal</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={pct} sx={{ mt: 1, height: 8, borderRadius: 1 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Meal Completion Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" fontWeight={700}>Meal Completion</Typography>
                <Tooltip title="Manually mark meals as completed by clicking the checkboxes. Only completed meals count towards your daily calorie and macro totals. Plan all meals to meet your daily nutrition goals." arrow>
                  <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {completedMeals} of {mealTypes.length} meals completed today
              </Typography>
              <LinearProgress variant="determinate" value={(completedMeals / mealTypes.length) * 100} sx={{ mb: 2, height: 8, borderRadius: 1 }} />
              <Grid container spacing={2}>
                {mealCompletion.map((meal, idx) => (
                  <Grid item xs={6} key={meal.type}>
                    <Box 
                      sx={{ 
                        p: 1.5, 
                        border: 1, 
                        borderColor: meal.completed ? 'success.main' : 'divider', 
                        borderRadius: 2, 
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          borderColor: meal.completed ? 'success.dark' : 'primary.main',
                          bgcolor: meal.completed ? 'success.50' : 'action.hover'
                        }
                      }}
                      onClick={() => toggleMealCompletion(meal.type)}
                    >
                      <Typography variant="h5">{meal.icon}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{meal.label}</Typography>
                      <Checkbox
                        checked={meal.completed}
                        onChange={() => toggleMealCompletion(meal.type)}
                        onClick={(e) => e.stopPropagation()}
                        color="success"
                        size="small"
                        sx={{ p: 0 }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => navigate('/planner')}
              >
                Plan Meals
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Enhanced Charts with Time Range Selector */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6" fontWeight={700}>Calorie Trend</Typography>
                  <Tooltip title="Shows your daily calorie intake over time. The green dashed line represents your daily calorie goal. Use the time range selector to view 7 or 30 days of data." arrow>
                    <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                  </Tooltip>
                </Stack>
                <ToggleButtonGroup
                  value={timeRange}
                  exclusive
                  onChange={(_, v) => v && setTimeRange(v)}
                  size="small"
                >
                  <ToggleButton value="7d">7 Days</ToggleButton>
                  <ToggleButton value="30d">30 Days</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="kcal" stroke="#667eea" fillOpacity={1} fill="url(#colorCal)" />
                    <ReferenceLine y={goal} stroke="#22c55e" strokeDasharray="5 5" label="Goal" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
              <Tooltip title="Visual representation of your macronutrient distribution. The donut chart shows the proportion of Protein (green), Carbs (blue), and Fat (orange) in your daily intake." arrow>
                <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
              </Tooltip>
            </Box>
            <MacroDonut protein={tp} carbs={tc} fat={tf} />
          </Box>
        </Grid>

        {/* Weekly Summary Card */}
        {weeklySummary && (
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6" fontWeight={700}>Weekly Summary</Typography>
                  <Tooltip title="Shows your average daily nutrition over the selected time period. Includes average calories and macros, plus highlights your best and worst days for comparison." arrow>
                    <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                  </Tooltip>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Average over {weeklySummary.days} days
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2">Average Calories</Typography>
                      <Typography variant="h6" fontWeight={700}>{weeklySummary.avgCalories} kcal</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={Math.min(100, (weeklySummary.avgCalories / goal) * 100)} sx={{ mt: 1, height: 6 }} />
                  </Box>
                  <Divider />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Avg Protein</Typography>
                      <Typography variant="h6" fontWeight={700} color="success.main">{weeklySummary.avgProtein}g</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Avg Carbs</Typography>
                      <Typography variant="h6" fontWeight={700} color="primary.main">{weeklySummary.avgCarbs}g</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Avg Fat</Typography>
                      <Typography variant="h6" fontWeight={700} color="warning.main">{weeklySummary.avgFat}g</Typography>
                    </Grid>
                  </Grid>
                  <Divider />
                  <Stack direction="row" spacing={2}>
                    <Box sx={{ flex: 1, p: 1.5, bgcolor: 'success.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Best Day</Typography>
                      <Typography variant="body2" fontWeight={600}>{weeklySummary.bestDay.calories} kcal</Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 1.5, bgcolor: 'error.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary">Worst Day</Typography>
                      <Typography variant="body2" fontWeight={600}>{weeklySummary.worstDay.calories} kcal</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Hydration Card */}
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Hydration</Typography>
                <Tooltip title="Tracks your daily water intake. Staying hydrated is essential for metabolism, energy levels, and overall health. Click the +250ml button to log water consumption." arrow>
                  <InfoOutlinedIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', cursor: 'help' }} />
                </Tooltip>
              </Stack>
              <Typography variant="h3" fontWeight={800}>{hydrationMl} / {hydrationGoal} ml</Typography>
              <LinearProgress variant="determinate" value={hydrationPct} sx={{ mt: 2, height: 8, borderRadius: 1 }} color="inherit" />
              <Button
                size="small"
                variant="outlined"
                onClick={addWater250}
                sx={{ mt: 1, borderColor: 'rgba(255,255,255,0.5)', color: 'white', '&:hover': { borderColor: 'white' } }}
              >
                +250 ml
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Adherence Score Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h6" fontWeight={700}>Adherence Score</Typography>
                <Tooltip title="Measures how consistently you stay within ±10% of your daily calorie goal. A higher score means better consistency. The streak shows consecutive days you've been on track." arrow>
                  <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                </Tooltip>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={3} sx={{ mt: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={adherence.percentage}
                    size={100}
                    thickness={4}
                    color="success"
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h5" fontWeight={800}>{adherence.percentage}%</Typography>
                    <Typography variant="caption" color="text.secondary">On Track</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        <LocalFireDepartmentIcon sx={{ fontSize: 16, verticalAlign: 'middle', color: 'error.main', mr: 0.5 }} />
                        {adherence.streak} Day Streak
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Days within ±10% of goal
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {adherence.days.filter(d => d.withinGoal).length} of {adherence.days.length} days on track
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
          </CardContent>
        </Card>
      </Grid>

        {/* Insights Section */}
        {insights.length > 0 && (
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <LightbulbIcon color="warning" />
                  <Typography variant="h6" fontWeight={700}>Insights & Recommendations</Typography>
                  <Tooltip title="Personalized recommendations based on your current nutrition status. These insights help you make better choices to meet your goals. Click 'Take Action' buttons to implement suggestions." arrow>
                    <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                  </Tooltip>
                </Stack>
                <Stack spacing={1.5}>
                  {insights.map((insight, idx) => (
                    <Paper
                      key={idx}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderLeft: 4,
                        borderLeftColor: insight.type === 'success' ? 'success.main' : insight.type === 'warning' ? 'warning.main' : 'info.main',
                        bgcolor: insight.type === 'success' ? 'success.50' : insight.type === 'warning' ? 'warning.50' : 'info.50'
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">{insight.message}</Typography>
                        {insight.action && (
                          <Button size="small" variant="outlined" onClick={insight.action}>
                            Take Action
                          </Button>
                        )}
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Quick Stats & Recent Activity */}
        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            {/* Quick Stats */}
            <Card elevation={3}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6" fontWeight={700}>Quick Stats</Typography>
                  <Tooltip title="Quick overview of your meal logging activity. Shows total meals logged, average meals per day, and your most frequently consumed food category." arrow>
                    <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                  </Tooltip>
                </Stack>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Total Meals Logged</Typography>
                    <Typography variant="h5" fontWeight={700}>{quickStats.totalMeals}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {quickStats.avgMealsPerDay} avg per day
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Favorite Category</Typography>
                    <Typography variant="h5" fontWeight={700}>{quickStats.favoriteCategory}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card elevation={3}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="h6" fontWeight={700}>Recent Activity</Typography>
                  <Tooltip title="Timeline of your recent actions in the app, such as meals completed, plans generated, and progress updates. Helps you track your engagement with the platform." arrow>
                    <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }} />
                  </Tooltip>
                </Stack>
                <List dense>
                  {recentActivity.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                      No recent activity
                    </Typography>
                  ) : (
                    recentActivity.map((activity, idx) => (
                      <ListItem key={idx}>
                        <ListItemIcon>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                            {activity.type === 'meal' ? <RestaurantIcon fontSize="small" /> : <TrendingUpIcon fontSize="small" />}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.message}
                          secondary={activity.time}
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Health Metrics: BMI, BMR, TDEE */}
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Health Metrics</Typography>
                <Tooltip 
                  title="Key health indicators: BMI (Body Mass Index) categorizes your weight status, BMR (Basal Metabolic Rate) is calories burned at rest, and TDEE (Total Daily Energy Expenditure) includes your activity level." 
                  arrow
                >
                  <InfoOutlinedIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', cursor: 'help' }} />
                </Tooltip>
              </Stack>
              <Grid container spacing={2}>
                {/* BMI */}
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>BMI</Typography>
                      <Tooltip 
                        title="Body Mass Index (BMI) is calculated from your height and weight using the formula: weight (kg) / height (m)². It helps categorize your weight status: Underweight (<18.5), Normal (18.5-24.9), Overweight (25-29.9), or Obese (≥30). BMI is a screening tool but doesn't directly measure body fat." 
                        arrow
                      >
                        <InfoOutlinedIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', cursor: 'help' }} />
                      </Tooltip>
                    </Stack>
                    <Typography variant="h4" fontWeight={800}>
                      {user?.bmi ? user.bmi.toFixed(1) : 'N/A'}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, mt: 0.5, display: 'block' }}>
                      {user?.weightLevel ? user.weightLevel.charAt(0).toUpperCase() + user.weightLevel.slice(1) : '—'}
                    </Typography>
                  </Box>
                </Grid>
                {/* BMR */}
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>BMR</Typography>
                      <Tooltip 
                        title="Basal Metabolic Rate (BMR) is the number of calories your body burns at rest to maintain basic physiological functions like breathing, circulation, and cell production. Calculated using the Mifflin-St Jeor equation based on your age, gender, height, and weight. This is your minimum daily calorie requirement without any activity." 
                        arrow
                      >
                        <InfoOutlinedIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', cursor: 'help' }} />
                      </Tooltip>
                    </Stack>
                    <Typography variant="h4" fontWeight={800}>
                      {user?.bmr ? `${user.bmr} kcal` : 'N/A'}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, mt: 0.5, display: 'block' }}>
                      Calories at rest
                    </Typography>
                  </Box>
                </Grid>
                {/* TDEE */}
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5} sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>TDEE</Typography>
                      <Tooltip 
                        title="Total Daily Energy Expenditure (TDEE) is your total daily calorie burn, including BMR plus calories burned through physical activity. Calculated as BMR × Activity Multiplier. Your activity level determines the multiplier: Sedentary (1.2), Light (1.375), Moderate (1.55), Active (1.725), or Athlete (1.9). This represents your actual daily calorie needs." 
                        arrow
                      >
                        <InfoOutlinedIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', cursor: 'help' }} />
                      </Tooltip>
                    </Stack>
                    <Typography variant="h4" fontWeight={800}>
                      {user?.tdee ? `${user.tdee} kcal` : 'N/A'}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, mt: 0.5, display: 'block' }}>
                      Total daily burn
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              {user?.dailyCalorieGoal && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>Your Daily Calorie Goal</Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                    {user.dailyCalorieGoal} kcal/day
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Based on your {user.goal === 'lose' ? 'weight loss' : user.goal === 'gain' ? 'weight gain' : 'maintenance'} goal
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
    </Grid>
    </Box>
  )
}
