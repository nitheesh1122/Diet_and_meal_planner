import React from 'react'
import { 
  Grid, Card, CardContent, Typography, Button, Stack, TextField, 
  IconButton, Chip, Box, LinearProgress, Paper,
  ButtonGroup, ToggleButtonGroup, ToggleButton, Skeleton
} from '@mui/material'
import { jsPDF } from 'jspdf'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import DownloadIcon from '@mui/icons-material/Download'
import RefreshIcon from '@mui/icons-material/Refresh'
import ClearIcon from '@mui/icons-material/Clear'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import TodayIcon from '@mui/icons-material/Today'
import FoodSearchDialog from '../components/FoodSearchDialog'
import RecommendationsDialog from '../components/RecommendationsDialog'
import GeneratePlanDialog from '../components/GeneratePlanDialog'
import FoodDetailDrawer from '../components/FoodDetailDrawer'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks']
const mealLabels = ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
const mealIcons = ['🌅', '☀️', '🌙', '🍎']

export default function Planner() {
  const { user } = useAuth()
  const [open, setOpen] = React.useState(false)
  const [openRec, setOpenRec] = React.useState(false)
  const [openGen, setOpenGen] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [selectedFood, setSelectedFood] = React.useState(null)
  const [selectedMealType, setSelectedMealType] = React.useState('breakfast')
  const today = new Date().toISOString().slice(0, 10)
  const [selectedDate, setSelectedDate] = React.useState(today)
  const [recs, setRecs] = React.useState([])
  const [plan, setPlan] = React.useState(null)
  const [rangeSpan, setRangeSpan] = React.useState('week')
  const [rangePlans, setRangePlans] = React.useState([])
  const [rangeLoading, setRangeLoading] = React.useState(false)
  const spanDays = rangeSpan === 'month' ? 30 : 7

  const load = React.useCallback(async () => {
    if (!user) return
    const data = await api.getMeals(user._id, selectedDate)
    setPlan(data)
    window.dispatchEvent(new Event('plan-updated'))
  }, [user, selectedDate])

  const fetchRangePlans = React.useCallback(async () => {
    if (!user) return
    setRangeLoading(true)
    try {
      const endDate = formatISODate(addDaysToDate(selectedDate, spanDays - 1))
      const data = await api.getMealsRange(user._id, selectedDate, endDate)
      setRangePlans(data || [])
    } finally {
      setRangeLoading(false)
    }
  }, [user, selectedDate, spanDays])

  React.useEffect(() => {
    if (user) load()
  }, [user, selectedDate, load])

  React.useEffect(() => {
    if (user) fetchRangePlans()
  }, [user, fetchRangePlans])

  const onSelectFood = (food) => {
    setSelectedFood(food)
    setDrawerOpen(true)
  }

  const addFromDrawer = async ({ mealType, foodId, quantity, servingSize, calories, protein, carbs, fat }) => {
    const payload = { date: selectedDate, mealType, items: [{ foodId, quantity, servingSize, calories, protein, carbs, fat }] }
    await api.addMeal(user._id, payload)
    setDrawerOpen(false)
    setOpen(false)
    await load()
    window.dispatchEvent(new Event('plan-updated'))
  }

  const removeMealItem = async (mealType, index) => {
    if (!plan || !user) return
    await api.removeMealItem(user._id, { date: selectedDate, mealType, itemIndex: index })
    await load()
    window.dispatchEvent(new Event('plan-updated'))
  }

  const onClearDay = async () => {
    if (!user || !window.confirm('Are you sure you want to clear all meals for this day?')) return
    await api.clearMeals(user._id, selectedDate)
    await load()
    window.dispatchEvent(new Event('plan-updated'))
  }

  const openRecommendations = async (mealType) => {
    const items = await api.recommendations(user._id, selectedDate, 12, { mealType, goal: user?.goal })
    setRecs(items)
    setOpenRec(true)
  }

  const onGenerate = async ({ startDate, span, sources }) => {
    await api.generateMeals(user._id, startDate, span, sources)
    await load()
    window.dispatchEvent(new Event('plan-updated'))
  }

  const changeDay = (delta) => {
    const nextDate = formatISODate(addDaysToDate(selectedDate, delta))
    setSelectedDate(nextDate)
  }

  const handleSpanChange = (_, value) => {
    if (value) setRangeSpan(value)
  }

  const downloadPDF = async (span = 'day') => {
    if (!user) return
    const doc = new jsPDF()
    let plansToExport = []

    if (span === 'day') {
      if (!plan) return
      plansToExport = [plan]
    } else {
      const days = span === 'month' ? 30 : 7
      const end = formatISODate(addDaysToDate(selectedDate, days - 1))
      const data = await api.getMealsRange(user._id, selectedDate, end)
      plansToExport = data || []
      if (!plansToExport.length) return
    }

    plansToExport.forEach((dayPlan, index) => {
      if (!dayPlan) return
      if (index > 0) doc.addPage()
      let y = 14
      const dayLabel = formatDisplayDate(dayPlan.date || selectedDate)
      doc.setFontSize(16)
      doc.text(`Meal Plan - ${dayLabel}`, 14, y)
      y += 8
      doc.setFontSize(12)
      const total = dayPlan.totalCalories || 0
      const tp = dayPlan.totalProtein || 0
      const tc = dayPlan.totalCarbs || 0
      const tf = dayPlan.totalFat || 0
      doc.text(`Totals: ${total} kcal  •  Protein ${tp}g  •  Carbs ${tc}g  •  Fat ${tf}g`, 14, y)
      y += 10
      mealTypes.forEach((key) => {
        const lines = formatMealLines(dayPlan, key)
        doc.setFont(undefined, 'bold')
        doc.text(`${toTitle(key)}`, 14, y)
        y += 6
        doc.setFont(undefined, 'normal')
        if (!lines.length) {
          doc.text('- None -', 18, y)
          y += 6
        } else {
          lines.forEach(line => {
            const split = doc.splitTextToSize(line, 180)
            split.forEach((l) => {
              if (y > 280) { doc.addPage(); y = 14 }
              doc.text(l, 18, y)
              y += 6
            })
          })
        }
        y += 4
        if (y > 280) { doc.addPage(); y = 14 }
      })
    })

    doc.save(`meal_plan_${span}_${selectedDate}.pdf`)
  }

  // Calculate totals
  const totalCalories = plan?.totalCalories || 0
  const totalProtein = plan?.totalProtein || 0
  const totalCarbs = plan?.totalCarbs || 0
  const totalFat = plan?.totalFat || 0

  // User goals
  const calorieGoal = user?.dailyCalorieGoal || 2000
  const proteinGoal = user?.dailyProteinGoal || 0
  const carbsGoal = user?.dailyCarbsGoal || 0
  const fatGoal = user?.dailyFatGoal || 0

  // Macro ratios from user preferences
  const userProteinPct = user?.macroRatio?.protein || 30
  const userCarbsPct = user?.macroRatio?.carbs || 40
  const userFatPct = user?.macroRatio?.fats || 30

  // Calculate actual macro percentages
  const actualProteinPct = totalCalories > 0 ? Math.round((totalProtein * 4 / totalCalories) * 100) : 0
  const actualCarbsPct = totalCalories > 0 ? Math.round((totalCarbs * 4 / totalCalories) * 100) : 0
  const actualFatPct = totalCalories > 0 ? Math.round((totalFat * 9 / totalCalories) * 100) : 0

  // Progress percentages
  const calorieProgress = Math.min(100, Math.round((totalCalories / calorieGoal) * 100))
  const proteinProgress = proteinGoal > 0 ? Math.min(100, Math.round((totalProtein / proteinGoal) * 100)) : 0
  const carbsProgress = carbsGoal > 0 ? Math.min(100, Math.round((totalCarbs / carbsGoal) * 100)) : 0
  const fatProgress = fatGoal > 0 ? Math.min(100, Math.round((totalFat / fatGoal) * 100)) : 0

  // Calculate meal totals
  const getMealTotals = (mealType) => {
    const items = plan?.meals?.[mealType] || []
    return items.reduce((acc, item) => ({
      calories: acc.calories + (item.calories * item.quantity),
      protein: acc.protein + (item.protein * item.quantity),
      carbs: acc.carbs + (item.carbs * item.quantity),
      fat: acc.fat + (item.fat * item.quantity)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Header Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>Meal Planner</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Plan and track your meals with macros, calendar shortcuts, and print options
                </Typography>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <ButtonGroup variant="outlined" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}>
                  <Button onClick={() => changeDay(-1)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                    <ChevronLeftIcon fontSize="small" />
                  </Button>
                  <Button onClick={() => setSelectedDate(today)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                    <TodayIcon fontSize="small" />
                  </Button>
                  <Button onClick={() => changeDay(1)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                    <ChevronRightIcon fontSize="small" />
                  </Button>
                </ButtonGroup>
                <TextField 
                  type="date" 
                  label="Date" 
                  InputLabelProps={{ shrink: true }} 
                  value={selectedDate} 
                  onChange={e => setSelectedDate(e.target.value)} 
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, width: 180 }}
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
                <ButtonGroup variant="contained" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <Button startIcon={<DownloadIcon />} onClick={() => downloadPDF('day')} disabled={!plan}>Day</Button>
                  <Button onClick={() => downloadPDF('week')}>Week</Button>
                  <Button onClick={() => downloadPDF('month')}>Month</Button>
                </ButtonGroup>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={load}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ClearIcon />}
                  onClick={onClearDay}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                >
                  Clear Day
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => { setSelectedMealType('breakfast'); setOpen(true) }}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                >
                  Add Food
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

      {/* Macro Summary Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Total Calories</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
              {Math.round(totalCalories)} / {calorieGoal}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={calorieProgress} 
              color={calorieProgress > 100 ? 'error' : 'primary'} 
              sx={{ mt: 1.5, height: 8, borderRadius: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {calorieProgress}% of daily goal
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Protein</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
              {Math.round(totalProtein)}g
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={proteinProgress} 
              color="success" 
              sx={{ mt: 1.5, height: 8, borderRadius: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {actualProteinPct}% of calories • Goal: {userProteinPct}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Carbs</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
              {Math.round(totalCarbs)}g
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={carbsProgress} 
              color="primary" 
              sx={{ mt: 1.5, height: 8, borderRadius: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {actualCarbsPct}% of calories • Goal: {userCarbsPct}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="caption" color="text.secondary">Fat</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
              {Math.round(totalFat)}g
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={fatProgress} 
              color="warning" 
              sx={{ mt: 1.5, height: 8, borderRadius: 1 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {actualFatPct}% of calories • Goal: {userFatPct}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Action Buttons */}
      <Grid item xs={12}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button variant="outlined" onClick={() => setOpenGen(true)}>Generate Plan</Button>
          <Button variant="outlined" onClick={() => openRecommendations(selectedMealType)}>Get Recommendations</Button>
        </Stack>
      </Grid>

      {/* Batch Planning Summary */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={700}>Upcoming plan overview</Typography>
                <Typography variant="body2" color="text.secondary">
                  Today + next {spanDays - 1} days snapshot with macro alerts
                </Typography>
              </Box>
              <ToggleButtonGroup
                value={rangeSpan}
                exclusive
                size="small"
                onChange={handleSpanChange}
              >
                <ToggleButton value="week">Next 7 days</ToggleButton>
                <ToggleButton value="month">Next 30 days</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
              {rangeLoading ? (
                Array.from({ length: Math.min(spanDays, 7) }).map((_, idx) => (
                  <Skeleton key={idx} variant="rounded" width={220} height={140} />
                ))
              ) : (
                rangePlans.map((rangePlan) => {
                  const dateISO = formatISODate(new Date(rangePlan.date || selectedDate))
                  const isTodayCard = dateISO === today
                  const calories = Math.round(rangePlan.totalCalories || 0)
                  const protein = Math.round(rangePlan.totalProtein || 0)
                  const carbs = Math.round(rangePlan.totalCarbs || 0)
                  const fat = Math.round(rangePlan.totalFat || 0)
                  const caloriePct = calorieGoal ? Math.min(150, Math.round((calories / calorieGoal) * 100)) : 0
                  const proteinPct = calories ? Math.round((protein * 4 / calories) * 100) : 0
                  const carbsPct = calories ? Math.round((carbs * 4 / calories) * 100) : 0
                  const fatPct = calories ? Math.round((fat * 9 / calories) * 100) : 0
                  const macroAlerts = []
                  if (Math.abs(proteinPct - userProteinPct) > 5) macroAlerts.push('Protein')
                  if (Math.abs(carbsPct - userCarbsPct) > 5) macroAlerts.push('Carbs')
                  if (Math.abs(fatPct - userFatPct) > 5) macroAlerts.push('Fat')
                  const overGoal = calorieGoal && calories > calorieGoal * 1.05
                  const underGoal = calorieGoal && calories < calorieGoal * 0.85
                  const borderColor = overGoal ? 'error.main' : underGoal ? 'warning.main' : 'divider'

                  return (
                    <Paper
                      key={rangePlan._id || dateISO}
                      variant="outlined"
                      sx={{
                        minWidth: 220,
                        p: 2,
                        borderColor,
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.main', boxShadow: 2 }
                      }}
                      onClick={() => setSelectedDate(dateISO)}
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        {isTodayCard ? 'Today' : formatDisplayDate(dateISO)}
                      </Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                        {calories} kcal
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, caloriePct)}
                        color={overGoal ? 'error' : 'success'}
                        sx={{ mt: 1, height: 6, borderRadius: 1 }}
                      />
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                        <Chip size="small" label={`P ${protein}g (${proteinPct}%)`} color={Math.abs(proteinPct - userProteinPct) > 5 ? 'warning' : 'success'} />
                        <Chip size="small" label={`C ${carbs}g (${carbsPct}%)`} color={Math.abs(carbsPct - userCarbsPct) > 5 ? 'warning' : 'info'} />
                        <Chip size="small" label={`F ${fat}g (${fatPct}%)`} color={Math.abs(fatPct - userFatPct) > 5 ? 'warning' : 'default'} />
                      </Stack>
                      <Typography variant="caption" color={macroAlerts.length ? 'error.main' : 'text.secondary'} sx={{ display: 'block', mt: 1 }}>
                        {macroAlerts.length ? `Macro alert: ${macroAlerts.join(', ')}` : 'Macros on target'}
                      </Typography>
                    </Paper>
                  )
                })
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Meal Sections */}
      {mealTypes.map((mealType, idx) => {
        const items = plan?.meals?.[mealType] || []
        const mealTotals = getMealTotals(mealType)
        const mealCaloriePct = totalCalories > 0 ? Math.round((mealTotals.calories / totalCalories) * 100) : 0

        return (
          <Grid item xs={12} md={6} key={mealType}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {mealIcons[idx]} {mealLabels[idx]}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {mealTotals.calories} kcal • P: {Math.round(mealTotals.protein)}g • C: {Math.round(mealTotals.carbs)}g • F: {Math.round(mealTotals.fat)}g
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setSelectedMealType(mealType)
                      setOpen(true)
                    }}
                  >
                    Add
                  </Button>
                </Stack>

                {items.length === 0 ? (
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center', 
                      bgcolor: 'action.hover',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.selected' }
                    }}
                    onClick={() => {
                      setSelectedMealType(mealType)
                      setOpen(true)
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No items added yet. Click to add food.
                    </Typography>
                  </Paper>
                ) : (
                  <Stack spacing={1.5}>
                    {items.map((item, itemIdx) => {
                      const itemCalories = item.calories * item.quantity
                      const itemProtein = item.protein * item.quantity
                      const itemCarbs = item.carbs * item.quantity
                      const itemFat = item.fat * item.quantity

                      return (
                        <Paper 
                          key={itemIdx} 
                          variant="outlined" 
                          sx={{ p: 2, position: 'relative', '&:hover': { bgcolor: 'action.hover' } }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {item.food?.name || 'Unknown Food'}
                              </Typography>
                              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                                <Chip 
                                  size="small" 
                                  label={`${item.quantity}× ${item.servingSize?.amount || ''}${item.servingSize?.unit || ''}`}
                                  variant="outlined"
                                />
                                <Chip size="small" label={`${Math.round(itemCalories)} kcal`} color="primary" />
                                <Chip size="small" label={`P: ${Math.round(itemProtein)}g`} color="success" />
                                <Chip size="small" label={`C: ${Math.round(itemCarbs)}g`} color="info" />
                                <Chip size="small" label={`F: ${Math.round(itemFat)}g`} color="warning" />
                              </Stack>
                            </Box>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeMealItem(mealType, itemIdx)}
                              sx={{ ml: 1 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Paper>
                      )
                    })}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        )
      })}

      {/* Dialogs */}
      <FoodSearchDialog 
        open={open} 
        onClose={() => setOpen(false)} 
        onSelect={onSelectFood} 
        mealType={selectedMealType} 
        goal={user?.goal} 
      />
      <RecommendationsDialog 
        open={openRec} 
        onClose={() => setOpenRec(false)} 
        items={recs} 
        onAdd={(f) => { onSelectFood(f) }} 
      />
      <GeneratePlanDialog 
        open={openGen} 
        onClose={() => setOpenGen(false)} 
        onGenerate={onGenerate} 
      />
      <FoodDetailDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        food={selectedFood} 
        onAdd={addFromDrawer} 
      />
      </Grid>
    </Box>
  )
}

function formatMealLines(plan, mealKey) {
  const items = plan?.meals?.[mealKey] || []
  return items.map(i => `${i.quantity}x ${i.food?.name || ''} (${i.servingSize?.amount||''}${i.servingSize?.unit||''}) - ${i.calories} kcal, P${i.protein} C${i.carbs} F${i.fat}`)
}

function toTitle(s) { 
  return s.charAt(0).toUpperCase() + s.slice(1) 
}

function addDaysToDate(dateStr, days) {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date
}

function formatISODate(date) {
  return date.toISOString().slice(0, 10)
}

function formatDisplayDate(dateInput) {
  const date = new Date(dateInput)
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}