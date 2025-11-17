import React from 'react'
import {
  Grid, Card, CardContent, Typography, Stack, TextField, Button, IconButton, Tooltip,
  Divider, FormControl, Select, MenuItem, InputLabel, Box, Chip, ButtonGroup, ToggleButtonGroup, ToggleButton,
  LinearProgress, Skeleton, Checkbox, InputAdornment, FormControlLabel, Switch, Paper, Badge, Menu, ListItemIcon, ListItemText,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DownloadIcon from '@mui/icons-material/Download'
import RefreshIcon from '@mui/icons-material/Refresh'
import TodayIcon from '@mui/icons-material/Today'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import CategoryIcon from '@mui/icons-material/Category'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import BreakfastDiningIcon from '@mui/icons-material/BreakfastDining'
import LunchDiningIcon from '@mui/icons-material/LunchDining'
import DinnerDiningIcon from '@mui/icons-material/DinnerDining'
import LocalCafeIcon from '@mui/icons-material/LocalCafe'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { useNotifications } from '../context/NotificationContext'
import jsPDF from 'jspdf'

const spanOptions = [
  { label: 'Today', value: 'day', days: 1, icon: <TodayIcon /> },
  { label: '7 days', value: 'week', days: 7, icon: <CalendarTodayIcon /> },
  { label: '30 days', value: 'month', days: 30, icon: <CalendarTodayIcon /> }
]

const categoryOptions = ['vegetables', 'fruits', 'protein', 'grains', 'dairy', 'spices', 'fats', 'beverages', 'other']
const defaultNewItem = { name: '', amount: 1, unit: 'g', category: 'vegetables' }
const makeId = () => `custom-${Date.now()}-${Math.random().toString(36).slice(2,7)}`

export default function GroceryList() {
  const { user } = useAuth()
  const { scheduleReminder, addNotification, toISTDate } = useNotifications()
  const iso = (d) => d.toISOString().slice(0,10)
  const today = iso(new Date())
  const [startDate, setStartDate] = React.useState(today)
  const [endDate, setEndDate] = React.useState(today)
  const [span, setSpan] = React.useState('day')
  const [groupedByMeal, setGroupedByMeal] = React.useState({})
  const [loading, setLoading] = React.useState(false)
  const [reminderTime, setReminderTime] = React.useState('18:00')
  const [reminderType, setReminderType] = React.useState('preset')
  const [listState, setListState] = React.useState({})
  const [customItems, setCustomItems] = React.useState([])
  const [newItem, setNewItem] = React.useState(defaultNewItem)
  const [savedLists, setSavedLists] = React.useState([])
  const [hideHave, setHideHave] = React.useState(false)
  const [downloadMenuAnchor, setDownloadMenuAnchor] = React.useState(null)
  const [expandedMeals, setExpandedMeals] = React.useState({
    breakfast: true,
    lunch: true,
    dinner: true,
    snacks: true
  })

  const storageKey = user ? `grocery_state_${user._id}_${startDate}_${endDate}` : null
  const savedListsKey = user ? `grocery_saved_${user._id}` : null

  const load = React.useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
    const res = await axios.get(`/api/grocery/${user._id}`, { params: { startDate, endDate } })
    setGroupedByMeal(res.data.data.groupedByMeal || {})
    } finally {
      setLoading(false)
  }
  }, [user, startDate, endDate])

  React.useEffect(() => { load() }, [load])
  React.useEffect(() => {
    const handler = () => load()
    window.addEventListener('plan-updated', handler)
    return () => window.removeEventListener('plan-updated', handler)
  }, [load])

  React.useEffect(() => {
    if (!storageKey) return
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || '{}')
      setListState(parsed.state || {})
      setCustomItems((parsed.custom || []).map(item => item.id ? item : { ...item, id: makeId() }))
    } catch {
      setListState({})
      setCustomItems([])
    }
  }, [storageKey])

  React.useEffect(() => {
    if (!storageKey) return
    localStorage.setItem(storageKey, JSON.stringify({ state: listState, custom: customItems }))
  }, [listState, customItems, storageKey])

  React.useEffect(() => {
    if (!savedListsKey) return
    try {
      const parsed = JSON.parse(localStorage.getItem(savedListsKey) || '[]')
      setSavedLists(parsed)
    } catch {
      setSavedLists([])
    }
  }, [savedListsKey])

  const persistSavedLists = React.useCallback((next) => {
    if (!savedListsKey) return
    setSavedLists(next)
    localStorage.setItem(savedListsKey, JSON.stringify(next))
  }, [savedListsKey])

  const changeRange = (deltaDays) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    start.setDate(start.getDate() + deltaDays)
    end.setDate(end.getDate() + deltaDays)
    setStartDate(iso(start))
    setEndDate(iso(end))
  }

  const applySpan = (value) => {
    const option = spanOptions.find(o => o.value === value)
    if (!option) return
    setSpan(value)
    const start = new Date(today)
    const end = new Date(today)
    end.setDate(end.getDate() + option.days - 1)
    setStartDate(iso(start))
    setEndDate(iso(end))
  }

  const getISTTime = (hours, minutes = 0) => {
    const istNow = toISTDate(new Date())
    const when = new Date(istNow)
    when.setHours(hours, minutes, 0, 0)
    if (when < new Date()) when.setDate(when.getDate() + 1)
    return when
  }

  const getRelativeTime = (hoursFromNow) => {
    const istNow = toISTDate(new Date())
    return new Date(istNow.getTime() + (hoursFromNow * 60 * 60 * 1000))
  }

  const presetTimes = [
    { label: 'Now', value: 'now', getTime: () => getRelativeTime(0) },
    { label: 'In 30 minutes', value: '30min', getTime: () => getRelativeTime(0.5) },
    { label: 'In 1 hour', value: '1hour', getTime: () => getRelativeTime(1) },
    { label: 'In 2 hours', value: '2hours', getTime: () => getRelativeTime(2) },
    { label: '6:00 PM IST', value: '18:00', getTime: () => getISTTime(18, 0) },
    { label: '8:00 PM IST', value: '20:00', getTime: () => getISTTime(20, 0) },
    { label: 'Custom Time', value: 'custom', getTime: null }
  ]

  const getSelectedTime = () => {
    if (reminderType === 'preset') {
      const preset = presetTimes.find(p => p.value === reminderTime)
      return preset ? preset.getTime() : getISTTime(18, 0)
    }
      const [hours, minutes] = reminderTime.split(':').map(Number)
    return getISTTime(hours || 18, minutes || 0)
  }

  const attachState = React.useCallback((item, category, isCustom) => {
    const baseAmount = Number(item.amount || 0)
    const id = isCustom ? item.id : `${item.name}|${item.unit}|${category}`
    const state = listState[id] || {}
    return {
      ...item,
      id,
      category,
      isCustom,
      amount: isCustom ? baseAmount : (state.overrideAmount ?? baseAmount),
      unit: isCustom ? item.unit : (state.overrideUnit || item.unit),
      checked: !!state.checked,
      haveIt: !!state.haveIt
    }
  }, [listState])

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks']
  const mealIcons = {
    breakfast: <BreakfastDiningIcon />,
    lunch: <LunchDiningIcon />,
    dinner: <DinnerDiningIcon />,
    snacks: <LocalCafeIcon />
  }
  const mealLabels = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snacks: 'Snacks'
  }

  const displayMeals = React.useMemo(() => {
    const map = {}
    mealTypes.forEach(mealType => {
      const items = groupedByMeal[mealType] || []
      map[mealType] = items.map(item => attachState(item, item.category || 'other', false))
    })
    // Add custom items to a "Custom" section or distribute by category
    customItems.forEach(item => {
      const cat = item.category || 'other'
      // For custom items, we'll add them to a special "custom" meal type or distribute
      // For now, let's add them to snacks as a default
      if (!map.snacks) map.snacks = []
      map.snacks.push(attachState(item, cat, true))
    })
    return map
  }, [groupedByMeal, customItems, attachState])

  const visibleMeals = React.useMemo(() => {
    if (!hideHave) return displayMeals
    return Object.fromEntries(
      Object.entries(displayMeals)
        .map(([meal, arr]) => [meal, arr.filter(item => !item.haveIt)])
        .filter(([,arr]) => arr.length)
    )
  }, [displayMeals, hideHave])

  const allItems = React.useMemo(() => Object.values(displayMeals).flat(), [displayMeals])
  const visibleItems = React.useMemo(() => Object.values(visibleMeals).flat(), [visibleMeals])

  const totalMealTypes = Object.keys(displayMeals).filter(k => displayMeals[k].length > 0).length
  const totalItems = allItems.length
  const checkedItems = allItems.filter(item => item.checked).length
  const mostNeededMeal = Object.entries(displayMeals).sort((a,b)=>(b[1].length - a[1].length))[0]?.[0]
  const actionableItems = visibleItems.filter(item => !item.haveIt && !item.checked)

  const handleAccordionChange = (mealType) => (event, isExpanded) => {
    setExpandedMeals(prev => ({ ...prev, [mealType]: isExpanded }))
  }

  const remindItem = (item) => {
    const when = getSelectedTime()
    scheduleReminder({ itemId: item.id, title: `${item.name} needs to be purchased.`, whenIST: when })
    addNotification({
      title: 'Reminder scheduled',
      body: `${item.name} at ${when.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST`
    })
  }

  const remindAllToday = () => {
    if (!actionableItems.length) return
    const when = getSelectedTime()
    actionableItems.forEach((i) => scheduleReminder({ itemId: i.id, title: `${i.name} needs to be purchased.`, whenIST: when }))
    addNotification({
      title: 'Reminders scheduled',
      body: `All ${actionableItems.length} items at ${when.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST`
    })
  }

  // Generate date range array
  const getDateRange = (start, end) => {
    const dates = []
    const startDate = new Date(start)
    const endDate = new Date(end)
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(iso(new Date(d)))
    }
    return dates
  }

  // Get items for a specific date
  const getItemsForDate = async (date) => {
    try {
      const res = await axios.get(`/api/grocery/${user._id}`, { params: { startDate: date, endDate: date } })
      return res.data.data.grouped || {}
    } catch {
      return {}
    }
  }

  const exportCSV = (mode = 'range') => {
    if (mode === 'day') {
      const rows = actionableItems.map(i => `${escapeCSV(i.name)},${i.amount},${i.unit},${titleCase(i.category)}`).join('\n')
      const header = 'Item,Amount,Unit,Category\n'
      downloadBlob(header + rows, `grocery_${startDate}.csv`, 'text/csv')
    } else if (mode === 'week') {
      const dates = getDateRange(startDate, endDate)
      const weekData = dates.map(date => {
        const dayItems = Object.values(displayMeals).flat().filter(item => {
          // This is simplified - in real implementation, you'd fetch per-day data
          return true
        })
        return { date, items: dayItems }
      })
      const rows = weekData.flatMap(({ date, items }) => 
        items.map(i => `${escapeCSV(date)},${escapeCSV(i.name)},${i.amount},${i.unit},${titleCase(i.category)}`)
      ).join('\n')
      const header = 'Date,Item,Amount,Unit,Category\n'
      downloadBlob(header + rows, `grocery_week_${startDate}_to_${endDate}.csv`, 'text/csv')
    } else {
      const rows = actionableItems.map(i => `${escapeCSV(i.name)},${i.amount},${i.unit},${titleCase(i.category)}`).join('\n')
      const header = 'Item,Amount,Unit,Category\n'
      downloadBlob(header + rows, `grocery_${startDate}_to_${endDate}.csv`, 'text/csv')
    }
  }

  const exportPDF = async (mode = 'range') => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let yPosition = margin

    if (mode === 'day') {
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
      doc.text('Grocery List', margin, yPosition)
      yPosition += 18
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
      doc.text(`Date: ${formatDate(startDate)}`, margin, yPosition)
      yPosition += 12
      
      mealTypes.forEach(mealType => {
        const arr = displayMeals[mealType] || []
        const filtered = arr.filter(item => !item.haveIt)
        if (!filtered.length) return
        if (yPosition > pageHeight - 60) { doc.addPage(); yPosition = margin }
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.text(`${mealLabels[mealType]} (${filtered.length})`, margin, yPosition)
        yPosition += 10
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        filtered.forEach((item, idx) => {
          const text = `${idx + 1}. ${item.name} — ${item.amount} ${item.unit}`
          const lines = doc.splitTextToSize(text, pageWidth - margin * 2)
          if (yPosition + lines.length * 5 > pageHeight - margin) { doc.addPage(); yPosition = margin }
          doc.text(lines, margin, yPosition)
          yPosition += lines.length * 5 + 4
        })
        yPosition += 6
      })
      doc.save(`grocery_${startDate}.pdf`)
    } else if (mode === 'week') {
      const dates = getDateRange(startDate, endDate)
      dates.forEach((date, dateIdx) => {
        if (dateIdx > 0) doc.addPage()
        yPosition = margin
        
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text(`Grocery List - ${formatDate(date)}`, margin, yPosition)
    yPosition += 15

        // For week view, we'll show all items grouped by meal type
        // In a real implementation, you'd fetch per-day data
        mealTypes.forEach(mealType => {
          const arr = displayMeals[mealType] || []
          const filtered = arr.filter(item => !item.haveIt)
          if (!filtered.length) return
          if (yPosition > pageHeight - 60) { doc.addPage(); yPosition = margin }
      doc.setFont('helvetica', 'bold')
          doc.setFontSize(12)
          doc.text(`${mealLabels[mealType]} (${filtered.length})`, margin, yPosition)
      yPosition += 10
          doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
          filtered.forEach((item, idx) => {
            const text = `${idx + 1}. ${item.name} — ${item.amount} ${item.unit}`
            const lines = doc.splitTextToSize(text, pageWidth - margin * 2)
            if (yPosition + lines.length * 5 > pageHeight - margin) { doc.addPage(); yPosition = margin }
            doc.text(lines, margin, yPosition)
            yPosition += lines.length * 5 + 4
          })
          yPosition += 6
        })
      })
      doc.save(`grocery_week_${startDate}_to_${endDate}.pdf`)
    } else {
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('Grocery List', margin, yPosition)
      yPosition += 18
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`${formatDate(startDate)} → ${formatDate(endDate)}`, margin, yPosition)
      yPosition += 12
      
      mealTypes.forEach(mealType => {
        const arr = displayMeals[mealType] || []
        const filtered = arr.filter(item => !item.haveIt)
        if (!filtered.length) return
        if (yPosition > pageHeight - 60) { doc.addPage(); yPosition = margin }
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.text(`${mealLabels[mealType]} (${filtered.length})`, margin, yPosition)
        yPosition += 10
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        filtered.forEach((item, idx) => {
          const text = `${idx + 1}. ${item.name} — ${item.amount} ${item.unit}`
          const lines = doc.splitTextToSize(text, pageWidth - margin * 2)
          if (yPosition + lines.length * 5 > pageHeight - margin) { doc.addPage(); yPosition = margin }
          doc.text(lines, margin, yPosition)
          yPosition += lines.length * 5 + 4
        })
        yPosition += 6
      })
      doc.save(`grocery_${startDate}_${endDate}.pdf`)
    }
  }

  const toggleItemState = (id, field) => {
    setListState(prev => {
      const next = { ...prev, [id]: { ...prev[id], [field]: !prev[id]?.[field] } }
      if (!next[id].checked && !next[id].haveIt && next[id].overrideAmount === undefined && !next[id].overrideUnit) {
        delete next[id]
      }
      return next
    })
  }

  const updateOverride = (id, patch) => {
    setListState(prev => {
      const next = { ...prev, [id]: { ...prev[id], ...patch } }
      if (!next[id].checked && !next[id].haveIt && (next[id].overrideAmount === undefined || next[id].overrideAmount === null) && !next[id].overrideUnit) {
        delete next[id]
      }
      return next
    })
  }

  const updateCustomItem = (id, field, value) => {
    setCustomItems(prev => prev.map(item => item.id === id ? { ...item, [field]: field === 'amount' ? Number(value) || 0 : value } : item))
  }

  const removeCustomItem = (id) => setCustomItems(prev => prev.filter(item => item.id !== id))

  const addCustomItem = () => {
    if (!newItem.name.trim()) return
    setCustomItems(prev => [...prev, { ...newItem, id: makeId(), amount: Number(newItem.amount) || 0 }])
    setNewItem(defaultNewItem)
  }

  const saveCurrentList = () => {
    const payload = allItems.filter(item => !item.haveIt).map(item => ({
      name: item.name,
      amount: item.amount,
      unit: item.unit,
      category: item.category
    }))
    if (!payload.length) return
    const name = window.prompt('Name this grocery list snapshot', `Week of ${startDate}`)
    if (!name) return
    const entry = { id: Date.now(), name, range: { startDate, endDate }, items: payload }
    persistSavedLists([entry, ...savedLists].slice(0, 8))
  }

  const applySavedList = (entry) => {
    setCustomItems(prev => [
      ...prev,
      ...entry.items.map(item => ({ ...item, id: makeId() }))
    ])
  }

  const deleteSavedList = (entry) => {
    persistSavedLists(savedLists.filter(item => item.id !== entry.id))
  }

  const canExport = actionableItems.length > 0
  const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Header Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
                <Box>
                  <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>Smart Grocery List</Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Auto-generated shopping list from your meal plans
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Button variant="contained" startIcon={<RefreshIcon />} onClick={load} sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}>
                    Refresh
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<FileDownloadIcon />}
                    onClick={(e) => setDownloadMenuAnchor(e.currentTarget)}
                    disabled={!canExport}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                  >
                    Download
                  </Button>
          </Stack>
        </Stack>

              {/* Date Range Controls */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <ButtonGroup variant="outlined" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}>
                  <Button onClick={() => changeRange(-1)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                    <ChevronLeftIcon />
                  </Button>
                  <Button onClick={() => { setStartDate(today); setEndDate(today) }} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                    <TodayIcon />
                  </Button>
                  <Button onClick={() => changeRange(1)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                    <ChevronRightIcon />
                  </Button>
                </ButtonGroup>
                <TextField
                  type="date"
                  label="Start Date"
                  size="small"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}
                />
                <TextField
                  type="date"
                  label="End Date"
                  size="small"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}
                />
                <ToggleButtonGroup
                  value={span}
                  exclusive
                  onChange={(_, v) => v && applySpan(v)}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
                >
                  {spanOptions.map(opt => (
                    <ToggleButton key={opt.value} value={opt.value} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                      {opt.icon}
                      <Box sx={{ ml: 1 }}>{opt.label}</Box>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, p: 1.5 }}>
                  <ShoppingCartIcon />
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={800}>{totalItems}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Items</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, p: 1.5 }}>
                  <CategoryIcon />
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={800}>{totalMealTypes}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Meal Types</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, p: 1.5 }}>
                  <TrendingUpIcon />
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={800}>{actionableItems.length}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>To Buy</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Progress</Typography>
                  <Typography variant="h6" fontWeight={700}>{progressPercent}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.3)' }} />
                <Typography variant="caption" sx={{ opacity: 0.8 }}>{checkedItems} of {totalItems} checked</Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Shopping List</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {span === 'day' ? 'Today\'s items' : span === 'week' ? 'This week\'s items' : 'This month\'s items'}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={<Switch checked={hideHave} onChange={(_, v) => setHideHave(v)} />}
                  label="Hide owned items"
                />
              </Stack>

              {loading ? (
                <Stack spacing={2}>
                  <Skeleton variant="rounded" height={100} />
                  <Skeleton variant="rounded" height={100} />
                  <Skeleton variant="rounded" height={100} />
                </Stack>
              ) : Object.keys(visibleMeals).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No items in this range
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generate a meal plan to populate your grocery list
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {mealTypes.map(mealType => {
                    const items = visibleMeals[mealType] || []
                    if (items.length === 0) return null
                    
                    const mealTotal = displayMeals[mealType]?.length || 0
                    const mealChecked = displayMeals[mealType]?.filter(i => i.checked).length || 0
                    const mealProgress = mealTotal > 0 ? Math.round((mealChecked / mealTotal) * 100) : 0
                    
                    return (
                      <Accordion
                        key={mealType}
                        expanded={expandedMeals[mealType]}
                        onChange={handleAccordionChange(mealType)}
                        elevation={2}
                        sx={{
                          '&:before': { display: 'none' },
                          borderLeft: 4,
                          borderColor: mealType === 'breakfast' ? '#f093fb' : mealType === 'lunch' ? '#4facfe' : mealType === 'dinner' ? '#fa709a' : '#43e97b'
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{
                            bgcolor: mealType === 'breakfast' ? 'rgba(240, 147, 251, 0.1)' : mealType === 'lunch' ? 'rgba(79, 172, 254, 0.1)' : mealType === 'dinner' ? 'rgba(250, 112, 154, 0.1)' : 'rgba(67, 233, 123, 0.1)',
                            '&:hover': { bgcolor: mealType === 'breakfast' ? 'rgba(240, 147, 251, 0.15)' : mealType === 'lunch' ? 'rgba(79, 172, 254, 0.15)' : mealType === 'dinner' ? 'rgba(250, 112, 154, 0.15)' : 'rgba(67, 233, 123, 0.15)' }
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                            <Box sx={{ color: mealType === 'breakfast' ? '#f093fb' : mealType === 'lunch' ? '#4facfe' : mealType === 'dinner' ? '#fa709a' : '#43e97b' }}>
                              {mealIcons[mealType]}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" spacing={2} alignItems="center">
                                <Typography variant="h6" fontWeight={700}>
                                  {mealLabels[mealType]}
                                </Typography>
                                <Chip 
                                  label={`${items.length} ${items.length === 1 ? 'item' : 'items'}`} 
                                  size="small" 
                                  color="primary"
                                  variant="outlined"
                                />
                                {mealTotal > 0 && (
                                  <Chip 
                                    label={`${mealProgress}% done`} 
                                    size="small" 
                                    color={mealProgress === 100 ? 'success' : 'default'}
                                  />
                                )}
                              </Stack>
                              {mealTotal > 0 && (
                                <LinearProgress 
                                  variant="determinate" 
                                  value={mealProgress} 
                                  sx={{ mt: 1, height: 6, borderRadius: 3 }}
                                  color={mealProgress === 100 ? 'success' : 'primary'}
                                />
                              )}
                            </Box>
                          </Stack>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 2 }}>
                          <Stack spacing={1.5}>
                            {items.map(item => (
                              <Paper
                                key={item.id}
                                elevation={0}
                                sx={{
                                  p: 2,
                                  border: 1,
                                  borderColor: item.checked ? 'success.main' : item.haveIt ? 'warning.main' : 'divider',
                                  borderRadius: 2,
                                  bgcolor: item.checked ? 'success.50' : item.haveIt ? 'warning.50' : 'background.paper',
                                  opacity: item.haveIt ? 0.7 : 1,
                                  transition: 'all 0.2s',
                                  '&:hover': { boxShadow: 2 }
                                }}
                              >
                                <Stack direction="row" spacing={2} alignItems="center">
                                  <Checkbox
                                    checked={item.checked}
                                    onChange={() => toggleItemState(item.id, 'checked')}
                                    color="success"
                                  />
                                  <Box sx={{ flex: 1 }}>
                                    <Typography
                                      variant="body1"
                                      fontWeight={600}
                                      sx={{ textDecoration: item.checked ? 'line-through' : 'none', mb: 1 }}
                                    >
                                      {item.name}
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                                      <TextField
                                        size="small"
                                        type="number"
                                        label="Quantity"
                                        value={item.amount}
                                        onChange={(e) => item.isCustom ? updateCustomItem(item.id, 'amount', e.target.value) : updateOverride(item.id, { overrideAmount: Number(e.target.value) })}
                                        sx={{ width: 100 }}
                                      />
                                      <TextField
                                        size="small"
                                        label="Unit"
                                        value={item.unit}
                                        onChange={(e) => item.isCustom ? updateCustomItem(item.id, 'unit', e.target.value) : updateOverride(item.id, { overrideUnit: e.target.value })}
                                        sx={{ width: 90 }}
                                      />
                                      <Chip label={titleCase(item.category)} size="small" variant="outlined" />
                                    </Stack>
                                  </Box>
                                  <Stack direction="row" spacing={0.5}>
                                    <Tooltip title={item.haveIt ? 'Bring back to list' : 'I already have this'}>
                                      <IconButton
                                        onClick={() => toggleItemState(item.id, 'haveIt')}
                                        color={item.haveIt ? 'warning' : 'default'}
                                        size="small"
                                      >
                                        <Inventory2OutlinedIcon />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Set reminder">
                                      <IconButton onClick={() => remindItem(item)} size="small">
                                        <NotificationsActiveIcon />
                                      </IconButton>
                                    </Tooltip>
                                    {item.isCustom && (
                                      <Tooltip title="Remove">
                                        <IconButton onClick={() => removeCustomItem(item.id)} size="small" color="error">
                                          <DeleteOutlineIcon />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Stack>
                                </Stack>
                              </Paper>
                            ))}
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    )
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Reminder Settings */}
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Reminder Settings</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Time Mode</InputLabel>
                    <Select value={reminderType} label="Time Mode" onChange={(e) => setReminderType(e.target.value)}>
                      <MenuItem value="preset">Preset</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            {reminderType === 'preset' ? (
                    <FormControl size="small" fullWidth>
                <InputLabel>Preset Time</InputLabel>
                      <Select value={reminderTime} label="Preset Time" onChange={(e) => setReminderTime(e.target.value)}>
                        {presetTimes.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                </Select>
              </FormControl>
            ) : (
              <TextField
                      size="small"
                type="time"
                label="Custom Time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                      fullWidth
                    />
                  )}
                  <Button
                    variant="contained"
                    startIcon={<NotificationsActiveIcon />}
                    onClick={remindAllToday}
                    disabled={!actionableItems.length}
                    fullWidth
                  >
                    Remind All ({actionableItems.length})
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Next reminder: {getSelectedTime().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Custom Items */}
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Add Custom Item</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <TextField
                    label="Item Name"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    size="small"
                    fullWidth
                  />
                  <Stack direction="row" spacing={1}>
                    <TextField
                      label="Amount"
                      type="number"
                      value={newItem.amount}
                      onChange={(e) => setNewItem(prev => ({ ...prev, amount: e.target.value }))}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      label="Unit"
                      value={newItem.unit}
                      onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                  </Stack>
                  <TextField
                    select
                    label="Category"
                    value={newItem.category}
                    onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                    size="small"
                    fullWidth
                  >
                    {categoryOptions.map(opt => <MenuItem key={opt} value={opt}>{titleCase(opt)}</MenuItem>)}
                  </TextField>
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={addCustomItem} fullWidth>
                    Add Item
            </Button>
          </Stack>
              </CardContent>
            </Card>

            {/* Saved Lists */}
            {savedLists.length > 0 && (
              <Card elevation={3}>
              <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>Saved Lists</Typography>
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {savedLists.map(entry => (
                      <Paper key={entry.id} elevation={1} sx={{ p: 1.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{entry.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{entry.items.length} items</Typography>
                          </Box>
                          <Stack direction="row" spacing={0.5}>
                            <Button size="small" variant="text" onClick={() => applySavedList(entry)}>Apply</Button>
                            <IconButton size="small" onClick={() => deleteSavedList(entry)}>
                              <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
              </CardContent>
            </Card>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Download Menu */}
      <Menu
        anchorEl={downloadMenuAnchor}
        open={Boolean(downloadMenuAnchor)}
        onClose={() => setDownloadMenuAnchor(null)}
      >
        <MenuItem onClick={() => { exportPDF('day'); setDownloadMenuAnchor(null); }}>
          <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Download Day (PDF)" secondary={formatDate(startDate)} />
        </MenuItem>
        <MenuItem onClick={() => { exportPDF('week'); setDownloadMenuAnchor(null); }}>
          <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Download Week (PDF)" secondary={`${formatDate(startDate)} - ${formatDate(endDate)}`} />
        </MenuItem>
        <MenuItem onClick={() => { exportPDF('range'); setDownloadMenuAnchor(null); }}>
          <ListItemIcon><PictureAsPdfIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Download Range (PDF)" secondary={`${formatDate(startDate)} - ${formatDate(endDate)}`} />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { exportCSV('day'); setDownloadMenuAnchor(null); }}>
          <ListItemIcon><InsertDriveFileIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Download Day (CSV)" secondary={formatDate(startDate)} />
        </MenuItem>
        <MenuItem onClick={() => { exportCSV('week'); setDownloadMenuAnchor(null); }}>
          <ListItemIcon><InsertDriveFileIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Download Week (CSV)" secondary={`${formatDate(startDate)} - ${formatDate(endDate)}`} />
        </MenuItem>
        <MenuItem onClick={() => { exportCSV('range'); setDownloadMenuAnchor(null); }}>
          <ListItemIcon><InsertDriveFileIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Download Range (CSV)" secondary={`${formatDate(startDate)} - ${formatDate(endDate)}`} />
        </MenuItem>
      </Menu>
    </Box>
  )
}

function InsightRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2">{label}</Typography>
      <Typography variant="body2" fontWeight={700}>{value}</Typography>
    </Stack>
  )
}

function titleCase(s) {
  return String(s || '')
    .split(/[_\s-]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function escapeCSV(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
