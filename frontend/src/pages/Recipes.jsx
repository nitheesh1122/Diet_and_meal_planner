import React from 'react'
import {
  Grid, Card, CardContent, Typography, Stack, Button, Chip, TextField,
  ToggleButtonGroup, ToggleButton, ButtonGroup, IconButton, Divider, Box, LinearProgress, Skeleton, Paper
} from '@mui/material'
import { jsPDF } from 'jspdf'
import RefreshIcon from '@mui/icons-material/Refresh'
import DownloadIcon from '@mui/icons-material/Download'
import FilterAltIcon from '@mui/icons-material/FilterAlt'
import TodayIcon from '@mui/icons-material/Today'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

const MEAL_TYPES = ['all','breakfast','lunch','dinner','snacks']

export default function Recipes() {
  const { user } = useAuth()
  const today = new Date().toISOString().slice(0,10)
  const [selectedDate, setSelectedDate] = React.useState(today)
  const [span, setSpan] = React.useState('day')
  const [data, setData] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [activeMeal, setActiveMeal] = React.useState('all')
  const [search, setSearch] = React.useState('')

  const loadRecipes = React.useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      if (span === 'day') {
        const plan = await api.getMeals(user._id, selectedDate)
        setData(plan ? [plan] : [])
      } else {
        const days = span === 'month' ? 30 : 7
        const end = formatISO(addDays(selectedDate, days - 1))
        const plans = await api.getMealsRange(user._id, selectedDate, end)
        setData(plans || [])
      }
    } finally {
      setLoading(false)
    }
  }, [user, selectedDate, span])

  React.useEffect(() => { loadRecipes() }, [loadRecipes])

  const changeDay = (delta) => {
    setSelectedDate(formatISO(addDays(selectedDate, delta)))
  }

  const filteredPlans = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return data.map((plan) => {
      const filteredMeals = {}
      MEAL_TYPES.slice(1).forEach(type => {
        const base = plan?.meals?.[type] || []
        filteredMeals[type] = base.filter(item => {
          const matchesMeal = activeMeal === 'all' || type === activeMeal
          const matchesSearch = !q || (item.food?.name || '').toLowerCase().includes(q)
          return matchesMeal && matchesSearch
        })
      })
      const hasAny = Object.values(filteredMeals).some(arr => arr.length)
      return hasAny || q || activeMeal === 'all'
        ? { ...plan, filteredMeals }
        : { ...plan, filteredMeals: plan.meals }
    })
  }, [data, activeMeal, search])

  // Calculate workload based on filtered meals
  const filteredWorkloadData = React.useMemo(() => {
    return filteredPlans.map((plan) => {
      const filteredMeals = {}
      MEAL_TYPES.slice(1).forEach(type => {
        if (activeMeal === 'all' || type === activeMeal) {
          filteredMeals[type] = plan.filteredMeals ? plan.filteredMeals[type] : plan?.meals?.[type] || []
        } else {
          filteredMeals[type] = []
        }
      })
      return { ...plan, filteredMeals }
    })
  }, [filteredPlans, activeMeal])

  const downloadRecipes = async (mode = 'day') => {
    const doc = new jsPDF({ unit: 'pt' })
    const plans = mode === span ? data : await (async () => {
      if (!user) return []
      if (mode === 'day') {
        const plan = await api.getMeals(user._id, selectedDate)
        return plan ? [plan] : []
      }
      const days = mode === 'month' ? 30 : 7
      const end = formatISO(addDays(selectedDate, days - 1))
      return (await api.getMealsRange(user._id, selectedDate, end)) || []
    })()
    if (!plans.length) return
    plans.forEach((plan, idx) => {
      if (idx > 0) doc.addPage()
      let y = 40
      doc.setFontSize(18)
      doc.text(`Recipes — ${formatDisplay(plan.date || selectedDate)}`, 40, y)
      y += 20
      doc.setFontSize(12)
      MEAL_TYPES.slice(1).forEach((type) => {
        const items = plan?.meals?.[type] || []
        if (!items.length) return
        if (y > pageHeight - 100) { 
          doc.addPage()
          y = addHeader(doc, 0)
        }
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(16)
        doc.setTextColor(102, 126, 234)
        doc.text(capitalize(type), margin, y)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(12)
        doc.setTextColor(0, 0, 0)
        y += 18
        items.forEach((it) => {
          const line = `${it.food?.name || ''} — ${fmtServing(it.servingSize)} — ${it.calories} kcal`
          const steps = buildSteps(it)
          const ingredients = buildIngredients(it)
          const text = [`• ${line}`, '  Ingredients:', ...ingredients.map(s=>`   - ${s}`), '  Steps:', ...steps.map((s,i)=>`   ${i+1}. ${s}`)]
          const chunk = doc.splitTextToSize(text.join('\n'), pageWidth - margin * 2)
          chunk.forEach(row => {
            if (y > pageHeight - 50) { 
              doc.addPage()
              y = addHeader(doc, 0)
            }
            doc.text(row, margin, y)
            y += 14
          })
          y += 8
        })
        y += 6
      })
    })
    
    // Add footer to all pages
    const totalPages = doc.internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      addFooter(doc, i, totalPages)
    }
    
    doc.save(`recipes_${mode}_${selectedDate}.pdf`)
  }

  const totalRecipes = data.reduce((sum, plan) =>
    sum + MEAL_TYPES.slice(1).reduce((acc, type) => acc + (plan?.meals?.[type]?.length || 0), 0), 0)
  const uniqueIngredients = new Set()
  data.forEach(plan => {
    MEAL_TYPES.slice(1).forEach(type => {
      (plan?.meals?.[type] || []).forEach(item => {
        buildIngredients(item).forEach(ing => uniqueIngredients.add(ing))
      })
    })
  })

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Header Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>Recipes & Instructions</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>Auto-generated prep cards based on your planned meals</Typography>
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
                  size="small"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}
                />
                <ToggleButtonGroup
                  value={span}
                  exclusive
                  onChange={(_, v) => v && setSpan(v)}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                >
                  <ToggleButton value="day" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Day</ToggleButton>
                  <ToggleButton value="week" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Week</ToggleButton>
                  <ToggleButton value="month" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>Month</ToggleButton>
                </ToggleButtonGroup>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={loadRecipes}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                >
                  Refresh
                </Button>
                <ButtonGroup variant="contained" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <Button startIcon={<DownloadIcon />} onClick={() => downloadRecipes('day')} disabled={!data.length}>Day</Button>
                  <Button onClick={() => downloadRecipes('week')} disabled={!data.length}>Week</Button>
                  <Button onClick={() => downloadRecipes('month')} disabled={!data.length}>Month</Button>
                </ButtonGroup>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="Search recipe..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <FilterAltIcon fontSize="small" sx={{ mr: 1 }} /> }}
                  sx={{ flex: 1, maxWidth: 400 }}
                />
                <ToggleButtonGroup value={activeMeal} exclusive onChange={(_, v) => v && setActiveMeal(v)} size="small">
                  {MEAL_TYPES.map(type => <ToggleButton key={type} value={type}>{capitalize(type)}</ToggleButton>)}
                </ToggleButtonGroup>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Recipes in view</Typography>
              <Typography variant="h3" fontWeight={800}>{totalRecipes}</Typography>
              <Typography variant="body2" color="text.secondary">{span === 'day' ? 'Today\'s dishes' : `Across ${data.length} day(s)`}</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <StatRow label="Unique ingredients" value={uniqueIngredients.size} />
                <StatRow label="Average prep steps" value={Math.round(avgSteps(data))} suffix="steps" />
                <StatRow label="Macro coverage" value={`${macroCoverage(data)}%`} suffix="" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Prep workload {activeMeal !== 'all' ? `(${capitalize(activeMeal)})` : ''}
              </Typography>
              {loading ? (
                <Skeleton variant="rounded" height={120} />
              ) : data.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No planned meals in this range.</Typography>
              ) : filteredWorkloadData.length === 0 || !filteredWorkloadData.some(plan => 
                Object.values(plan.filteredMeals || {}).some(arr => arr.length > 0)
              ) ? (
                <Typography variant="body2" color="text.secondary">
                  No {activeMeal !== 'all' ? capitalize(activeMeal) : ''} meals in this range.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {workloadBlocks(filteredWorkloadData).map(block => (
                    <Box key={block.label}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption">{block.label}</Typography>
                        <Typography variant="caption">{block.value} mins</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={block.percent} color={block.color} />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          {loading ? (
            <Skeleton variant="rounded" height={320} />
          ) : filteredPlans.length === 0 ? (
            <Card elevation={3}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No recipes match your filters.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            filteredPlans.map((plan) => (
              <Card key={plan._id || plan.date || Math.random()} elevation={3} sx={{ mb: 3 }}>
                <CardContent>
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{formatDisplay(plan.date || selectedDate)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {sumCalories(plan)} kcal • {sumMeals(plan)} dishes
                      </Typography>
                    </Box>
                    <Button variant="outlined" size="small" onClick={() => downloadPlan(plan, user)}>
                      Download day PDF
                    </Button>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    {MEAL_TYPES.slice(1).map((type) => {
                      const items = plan.filteredMeals ? plan.filteredMeals[type] : plan?.meals?.[type] || []
                      if (!items.length) return null
                      return (
                        <Grid item xs={12} md={6} key={`${plan._id}-${type}`}>
                          <MealRecipeColumn title={capitalize(type)} items={items} />
                        </Grid>
                      )
                    })}
                  </Grid>
                </CardContent>
              </Card>
            ))
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

function StatRow({ label, value, suffix }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body2" fontWeight={700}>{value}{suffix ? ` ${suffix}` : ''}</Typography>
    </Stack>
  )
}

function MealRecipeColumn({ title, items }) {
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>{title}</Typography>
      <Stack spacing={2}>
        {items.map((item, idx) => (
          <RecipeTile key={`${item.food?._id || idx}`} item={item} />
        ))}
      </Stack>
    </Box>
  )
}

function RecipeTile({ item }) {
  const name = item.food?.name || 'Food'
  const ingredients = buildIngredients(item)
  const steps = buildSteps(item)
  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
      <Stack spacing={0.5}>
        <Typography variant="subtitle1" fontWeight={700}>{name}</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip size="small" label={`${item.calories} kcal`} />
          <Chip size="small" label={`P ${item.protein}g`} />
          <Chip size="small" label={`C ${item.carbs}g`} />
          <Chip size="small" label={`F ${item.fat}g`} />
          <Chip size="small" label={fmtServing(item.servingSize)} />
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>Ingredients</Typography>
        <Stack component="ul" sx={{ m: 0, pl: 3 }}>
          {ingredients.map((s, i) => (<li key={i}><Typography variant="body2">{s}</Typography></li>))}
        </Stack>
        <Typography variant="caption" color="text.secondary">Steps</Typography>
        <Stack component="ol" sx={{ m: 0, pl: 3 }}>
          {steps.map((s, i) => (<li key={i}><Typography variant="body2">{s}</Typography></li>))}
        </Stack>
      </Stack>
    </Box>
  )
}

function downloadPlan(plan, user = null) {
  const doc = new jsPDF({ unit: 'pt' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 40
  
  // Helper function to add header
  const addHeader = (doc, yPos) => {
    let y = yPos
    // Header background
    doc.setFillColor(102, 126, 234)
    doc.rect(0, 0, pageWidth, 50, 'F')
    
    // Title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('Recipes', margin, y + 20)
    
    // User name
    if (user?.name) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`User: ${user.name}`, pageWidth - margin - 80, y + 12)
    }
    
    // Download date/time
    const downloadDateTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.setFontSize(10)
    doc.text(`Downloaded: ${downloadDateTime}`, pageWidth - margin - 80, y + 28)
    
    doc.setTextColor(0, 0, 0)
    return y + 60
  }

  // Helper function to add footer
  const addFooter = (doc, pageNum, totalPages) => {
    doc.setFontSize(9)
    doc.setTextColor(128, 128, 128)
    doc.setFont('helvetica', 'italic')
    const footerText = `Page ${pageNum} of ${totalPages} | Meal Planner App`
    const textWidth = doc.getTextWidth(footerText)
    doc.text(footerText, (pageWidth - textWidth) / 2, pageHeight - 15)
    doc.setTextColor(0, 0, 0)
  }

  let y = addHeader(doc, 0)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(`Date: ${formatDisplay(plan.date || new Date())}`, margin, y)
  y += 20
  doc.setFontSize(12)
  MEAL_TYPES.slice(1).forEach((type) => {
    const items = plan?.meals?.[type] || []
    if (!items.length) return
      if (y > pageHeight - 100) { 
        doc.addPage()
        y = addHeader(doc, 0)
      }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(102, 126, 234)
    doc.text(capitalize(type), margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    y += 18
    items.forEach((it) => {
      const line = `${it.food?.name || ''} — ${fmtServing(it.servingSize)} — ${it.calories} kcal`
      const steps = buildSteps(it)
      const ingredients = buildIngredients(it)
      const text = [`• ${line}`, '  Ingredients:', ...ingredients.map(s=>`   - ${s}`), '  Steps:', ...steps.map((s,i)=>`   ${i+1}. ${s}`)]
      const chunk = doc.splitTextToSize(text.join('\n'), pageWidth - margin * 2)
      chunk.forEach(row => {
        if (y > pageHeight - 50) { 
          doc.addPage()
          y = addHeader(doc, 0)
        }
        doc.text(row, margin, y)
        y += 14
      })
      y += 8
    })
    y += 6
  })
  
  // Add footer to all pages
  const totalPages = doc.internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    addFooter(doc, i, totalPages)
  }
  
  doc.save(`recipes_${plan.date || 'day'}.pdf`)
}

function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d
}

function formatISO(date) {
  return (typeof date === 'string' ? new Date(date) : date).toISOString().slice(0,10)
}

function formatDisplay(dateInput) {
  const d = new Date(dateInput)
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function sumCalories(plan) {
  return MEAL_TYPES.slice(1).reduce((acc, type) =>
    acc + (plan?.meals?.[type] || []).reduce((s, item) => s + (item.calories * item.quantity), 0), 0)
}

function sumMeals(plan) {
  return MEAL_TYPES.slice(1).reduce((acc, type) => acc + (plan?.meals?.[type]?.length || 0), 0)
}

function avgSteps(plans) {
  let total = 0, count = 0
  plans.forEach(plan => {
    MEAL_TYPES.slice(1).forEach(type => {
      (plan?.meals?.[type] || []).forEach(item => {
        total += buildSteps(item).length
        count += 1
      })
    })
  })
  return count ? total / count : 0
}

function macroCoverage(plans) {
  let proteins = 0, carbs = 0, fats = 0
  plans.forEach(plan => {
    MEAL_TYPES.slice(1).forEach(type => {
      (plan?.meals?.[type] || []).forEach(item => {
        proteins += item.protein || 0
        carbs += item.carbs || 0
        fats += item.fat || 0
      })
    })
  })
  const total = proteins + carbs + fats
  return total ? Math.min(100, Math.round((proteins / total) * 100)) : 0
}

function workloadBlocks(plans) {
  const totals = {
    prep: 0,
    cook: 0,
    plate: 0
  }
  plans.forEach(plan => {
    MEAL_TYPES.slice(1).forEach(type => {
      // Use filteredMeals if available (when meal type filter is active), otherwise use meals
      const items = plan.filteredMeals?.[type] || plan?.meals?.[type] || []
      items.forEach(item => {
        totals.prep += Math.max(5, Math.round(item.servingSize?.amount/20 || 5))
        totals.cook += Math.max(10, Math.round(item.calories/20 || 10))
        totals.plate += 5
      })
    })
  })
  const sum = totals.prep + totals.cook + totals.plate || 1
  return [
    { label: 'Prep & chopping', value: totals.prep, percent: Math.round((totals.prep / sum) * 100), color: 'primary' },
    { label: 'Cooking time', value: totals.cook, percent: Math.round((totals.cook / sum) * 100), color: 'success' },
    { label: 'Plating & serving', value: totals.plate, percent: Math.round((totals.plate / sum) * 100), color: 'warning' }
  ]
}

function buildIngredients(it) {
  // Use ingredients from database if available
  const ingredients = it.food?.ingredients;
  
  if (ingredients && Array.isArray(ingredients) && ingredients.length > 0) {
    const qty = Number(it.quantity || 1);
    return ingredients.map(ing => {
      const amount = Number(ing.amount || 0) * qty;
      const unit = ing.unit || 'g';
      const name = ing.name || 'Unknown';
      // Format amount: show decimals only if needed
      const formattedAmount = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
      return `${formattedAmount} ${unit} ${name}`;
    });
  }
  
  // Fallback to heuristic for foods without ingredient data
  const base = it.food?.name || 'Item'
  const serving = fmtServing(it.servingSize)
  const cat = (it.food?.category || 'other').toLowerCase()
  const extras = cat === 'protein' ? ['Salt', 'Pepper', 'Olive oil']
    : cat === 'grains' ? ['Salt', 'Water', 'Spices (optional)']
    : cat === 'vegetables' ? ['Salt', 'Olive oil', 'Garlic']
    : ['Salt']
  return [`${serving} ${base}`, ...extras]
}

function buildSteps(it) {
  // Use recipe from database if available
  const recipe = it.food?.recipe;
  if (recipe && typeof recipe === 'string' && recipe.trim().length > 0) {
    // Split recipe by newlines and filter empty lines
    return recipe.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Remove numbered prefixes like "1. ", "2. ", etc.
        return line.replace(/^\d+\.\s*/, '').trim();
      })
      .filter(line => line.length > 0); // Filter again after trimming
  }
  
  // Fallback to heuristic for foods without recipe data
  const cat = (it.food?.category || 'other').toLowerCase()
  if (cat === 'protein') return ['Season protein', 'Pan-sear or grill until cooked', 'Rest and serve']
  if (cat === 'grains') return ['Rinse grains', 'Boil in water until tender', 'Season and serve']
  if (cat === 'vegetables') return ['Chop vegetables', 'Saute with oil and garlic', 'Season and serve']
  return ['Prepare ingredients', 'Cook appropriately', 'Season and serve']
}

function fmtServing(s) {
  if (!s) return ''
  const amt = s.amount ? `${s.amount}` : ''
  const unit = s.unit ? ` ${s.unit}` : ''
  return `${amt}${unit}`.trim()
}

function capitalize(s){ return s?.charAt(0).toUpperCase() + s?.slice(1) }
