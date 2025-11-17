import React from 'react'
import {
  Card, CardContent, Typography, Stack, TextField, Button, Box, Paper, Grid,
  Tabs, Tab, Chip, LinearProgress, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, Divider, ToggleButtonGroup, ToggleButton, Tooltip
} from '@mui/material'
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip,
  ReferenceLine, Legend, ComposedChart, Bar
} from 'recharts'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import RemoveIcon from '@mui/icons-material/Remove'
import EditIcon from '@mui/icons-material/Edit'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import StraightenIcon from '@mui/icons-material/Straighten'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

export default function Progress() {
  const { user } = useAuth()
  const [progress, setProgress] = React.useState(null)
  const [weight, setWeight] = React.useState('')
  const [activeTab, setActiveTab] = React.useState(0)
  const [timeRange, setTimeRange] = React.useState('30d')
  const [goalDialogOpen, setGoalDialogOpen] = React.useState(false)
  const [goalWeight, setGoalWeight] = React.useState('')
  const [goalDate, setGoalDate] = React.useState('')
  const [measurements, setMeasurements] = React.useState({
    chest: '', waist: '', hips: '', arms: '', thighs: '', bodyFat: ''
  })
  const [showMeasurements, setShowMeasurements] = React.useState(false)

  const load = async () => {
    if (!user?._id) return
    const data = await api.getProgress(user._id)
    setProgress(data)
    if (data?.goalWeight?.weight) {
      setGoalWeight(String(data.goalWeight.weight))
      if (data.goalWeight.targetDate) {
        setGoalDate(new Date(data.goalWeight.targetDate).toISOString().slice(0, 10))
      }
    }
  }

  React.useEffect(() => { if (user) load() }, [user])

  const addEntry = async () => {
    if (!weight || !user?._id) return
    const entry = {
      weight: Number(weight),
      date: new Date().toISOString(),
      measurements: showMeasurements ? {
        chest: measurements.chest ? Number(measurements.chest) : undefined,
        waist: measurements.waist ? Number(measurements.waist) : undefined,
        hips: measurements.hips ? Number(measurements.hips) : undefined,
        arms: measurements.arms ? Number(measurements.arms) : undefined,
        thighs: measurements.thighs ? Number(measurements.thighs) : undefined,
      } : undefined,
      bodyFat: measurements.bodyFat ? Number(measurements.bodyFat) : undefined
    }
    await api.addProgress(user._id, entry)
    setWeight('')
    setMeasurements({ chest: '', waist: '', hips: '', arms: '', thighs: '', bodyFat: '' })
    setShowMeasurements(false)
    load()
  }

  const updateGoal = async () => {
    if (!user?._id || !goalWeight) return
    await api.updateProgressGoal(user._id, {
      goalWeight: Number(goalWeight),
      targetDate: goalDate ? new Date(goalDate).toISOString() : undefined
    })
    setGoalDialogOpen(false)
    load()
  }

  // Calculate statistics
  const entries = progress?.entries || []
  const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date))
  const latestWeight = sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1].weight : null
  const startingWeight = progress?.startingWeight?.weight || latestWeight
  const goalWeightValue = progress?.goalWeight?.weight
  const totalChange = latestWeight && startingWeight ? (latestWeight - startingWeight).toFixed(1) : null
  const goalProgress = progress?.goalProgress || null

  // Calculate trend
  const getTrend = () => {
    if (sortedEntries.length < 2) return null
    const recent = sortedEntries.slice(-7)
    if (recent.length < 2) return null
    const first = recent[0].weight
    const last = recent[recent.length - 1].weight
    const change = last - first
    return { change: change.toFixed(1), direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable' }
  }

  const trend = getTrend()

  // Calculate weekly average change
  const weeklyChange = React.useMemo(() => {
    if (sortedEntries.length < 2) return null
    const last7 = sortedEntries.slice(-7)
    if (last7.length < 2) return null
    const first = last7[0].weight
    const last = last7[last7.length - 1].weight
    const days = (new Date(last7[last7.length - 1].date) - new Date(last7[0].date)) / (1000 * 60 * 60 * 24)
    if (days === 0) return null
    const change = last - first
    const weekly = (change / days) * 7
    return weekly.toFixed(2)
  }, [sortedEntries])

  // Calculate consistency
  const consistency = React.useMemo(() => {
    if (sortedEntries.length === 0) return { days: 0, streak: 0, lastEntry: null }
    const last30Days = sortedEntries.filter(e => {
      const daysAgo = (new Date() - new Date(e.date)) / (1000 * 60 * 60 * 24)
      return daysAgo <= 30
    })
    
    // Calculate streak
    let streak = 0
    const today = new Date().toISOString().slice(0, 10)
    for (let i = sortedEntries.length - 1; i >= 0; i--) {
      const entryDate = new Date(sortedEntries[i].date).toISOString().slice(0, 10)
      const expectedDate = new Date(Date.now() - streak * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      if (entryDate === expectedDate || entryDate === today) {
        streak++
      } else {
        break
      }
    }

    return {
      days: last30Days.length,
      streak,
      lastEntry: sortedEntries[sortedEntries.length - 1]?.date
    }
  }, [sortedEntries])

  // Prepare chart data
  const getChartData = () => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : sortedEntries.length
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return sortedEntries
      .filter(e => new Date(e.date) >= cutoffDate)
      .map(e => ({
        date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: e.weight,
        bodyFat: e.bodyFat,
        waist: e.measurements?.waist,
        chest: e.measurements?.chest,
        hips: e.measurements?.hips
      }))
  }

  const chartData = getChartData()

  // Comparison data
  const getComparisonData = () => {
    if (sortedEntries.length < 7) return null
    
    const now = new Date()
    const thisWeekStart = new Date(now)
    thisWeekStart.setDate(thisWeekStart.getDate() - 7)
    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)

    const thisWeek = sortedEntries.filter(e => new Date(e.date) >= thisWeekStart)
    const lastWeek = sortedEntries.filter(e => {
      const date = new Date(e.date)
      return date >= lastWeekStart && date < thisWeekStart
    })

    if (thisWeek.length === 0 || lastWeek.length === 0) return null

    const thisWeekAvg = thisWeek.reduce((sum, e) => sum + e.weight, 0) / thisWeek.length
    const lastWeekAvg = lastWeek.reduce((sum, e) => sum + e.weight, 0) / lastWeek.length

    return {
      thisWeek: { avg: thisWeekAvg.toFixed(1), count: thisWeek.length },
      lastWeek: { avg: lastWeekAvg.toFixed(1), count: lastWeek.length },
      change: (thisWeekAvg - lastWeekAvg).toFixed(1)
    }
  }

  const comparison = getComparisonData()

  // Calculate estimated completion
  const getEstimatedCompletion = () => {
    if (!goalWeightValue || !latestWeight || !startingWeight || !weeklyChange || Math.abs(Number(weeklyChange)) < 0.01) return null
    
    const remaining = goalWeightValue - latestWeight
    const weeklyChangeNum = Number(weeklyChange)
    if (Math.abs(weeklyChangeNum) < 0.01) return null
    
    const weeksNeeded = Math.abs(remaining / weeklyChangeNum)
    const completionDate = new Date()
    completionDate.setDate(completionDate.getDate() + (weeksNeeded * 7))
    
    return {
      weeks: Math.ceil(weeksNeeded),
      date: completionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    }
  }

  const estimatedCompletion = getEstimatedCompletion()

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Header Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
                  Progress Tracking
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Monitor your weight and fitness journey over time
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setGoalDialogOpen(true)}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                {goalWeightValue ? 'Edit Goal' : 'Set Goal'}
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Goal Overview Section */}
        {goalWeightValue && startingWeight && latestWeight && (
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Goal Progress
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                      {user?.goal === 'lose' ? 'Lose' : user?.goal === 'gain' ? 'Gain' : 'Maintain'} Weight
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="baseline">
                      <Typography variant="h4" fontWeight={800}>
                        {goalProgress ? `${goalProgress.percentage.toFixed(0)}%` : '0%'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        of goal achieved
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={goalProgress ? Math.min(100, Math.max(0, goalProgress.percentage)) : 0}
                      sx={{ mt: 2, height: 10, borderRadius: 1 }}
                      color={goalProgress?.percentage >= 100 ? 'success' : 'primary'}
                    />
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Starting: {startingWeight} kg
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Current: {latestWeight} kg
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Goal: {goalWeightValue} kg
                      </Typography>
                      {goalProgress && (
                        <Typography variant="caption" color="text.secondary">
                          Remaining: {Math.abs(goalProgress.remaining).toFixed(1)} kg
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                  <Box sx={{ textAlign: 'center', minWidth: 200 }}>
                    {estimatedCompletion && (
                      <>
                        <Typography variant="caption" color="text.secondary">
                          Estimated completion
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                          {estimatedCompletion.date}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {estimatedCompletion.weeks} weeks at current rate
                        </Typography>
                      </>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Key Metrics Cards */}
        {latestWeight && (
          <>
            <Grid item xs={12} md={3}>
              <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>Current Weight</Typography>
                      <Typography variant="h3" fontWeight={800}>{latestWeight} kg</Typography>
                      {trend && (
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                          {trend.direction === 'up' && <TrendingUpIcon fontSize="small" />}
                          {trend.direction === 'down' && <TrendingDownIcon fontSize="small" />}
                          {trend.direction === 'stable' && <RemoveIcon fontSize="small" />}
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            {trend.change > 0 ? '+' : ''}{trend.change} kg (7d)
                          </Typography>
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            {startingWeight && (
              <Grid item xs={12} md={3}>
                <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>Total Progress</Typography>
                    <Typography variant="h3" fontWeight={800}>
                      {totalChange > 0 ? '+' : ''}{totalChange} kg
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                      From {startingWeight} kg
                    </Typography>
                    {goalProgress && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, Math.max(0, goalProgress.percentage))}
                          sx={{ height: 8, borderRadius: 1 }}
                          color="inherit"
                        />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
            {weeklyChange && (
              <Grid item xs={12} md={3}>
                <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>Weekly Average</Typography>
                    <Typography variant="h3" fontWeight={800}>
                      {weeklyChange > 0 ? '+' : ''}{weeklyChange} kg/week
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                      {Math.abs(Number(weeklyChange)) < 0.5 ? 'Healthy rate' : Math.abs(Number(weeklyChange)) < 1 ? 'Moderate rate' : 'Rapid change'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
            <Grid item xs={12} md={3}>
              <Card elevation={3} sx={{ height: '100%', background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: 'white' }}>
        <CardContent>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9, mb: 1 }}>Consistency</Typography>
                  <Typography variant="h3" fontWeight={800}>{consistency.days}/30</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                    Days logged • {consistency.streak} day streak
          </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Multi-Metric Tracking Tabs */}
        <Grid item xs={12}>
          <Card elevation={3}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>Progress Charts</Typography>
                <ToggleButtonGroup
                  value={timeRange}
                  exclusive
                  onChange={(_, v) => v && setTimeRange(v)}
                  size="small"
                >
                  <ToggleButton value="7d">7 Days</ToggleButton>
                  <ToggleButton value="30d">30 Days</ToggleButton>
                  <ToggleButton value="90d">90 Days</ToggleButton>
                  <ToggleButton value="all">All Time</ToggleButton>
                </ToggleButtonGroup>
              </Stack>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                <Tab label="Weight" />
                <Tab label="Body Measurements" />
                <Tab label="Body Fat %" />
              </Tabs>
              
              {activeTab === 0 && (
                <Box sx={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                    <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        fill="#667eea"
                        fillOpacity={0.2}
                        stroke="#667eea"
                        strokeWidth={2}
                        name="Weight"
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#667eea"
                        strokeWidth={2}
                        dot={{ fill: '#667eea', r: 4 }}
                        name="Weight"
                      />
                      {goalWeightValue && (
                        <ReferenceLine y={goalWeightValue} stroke="#22c55e" strokeDasharray="5 5" label="Goal" />
                      )}
                      {startingWeight && (
                        <ReferenceLine y={startingWeight} stroke="#f59e0b" strokeDasharray="3 3" label="Starting" />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              )}

              {activeTab === 1 && (
                <Box sx={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <LineChart data={chartData.filter(d => d.waist || d.chest || d.hips)} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: 'Measurement (cm)', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip />
                      <Legend />
                      {chartData.some(d => d.waist) && (
                        <Line type="monotone" dataKey="waist" stroke="#ef4444" strokeWidth={2} name="Waist" dot={{ r: 4 }} />
                      )}
                      {chartData.some(d => d.chest) && (
                        <Line type="monotone" dataKey="chest" stroke="#3b82f6" strokeWidth={2} name="Chest" dot={{ r: 4 }} />
                      )}
                      {chartData.some(d => d.hips) && (
                        <Line type="monotone" dataKey="hips" stroke="#8b5cf6" strokeWidth={2} name="Hips" dot={{ r: 4 }} />
                      )}
              </LineChart>
            </ResponsiveContainer>
                </Box>
              )}

              {activeTab === 2 && (
                <Box sx={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <AreaChart data={chartData.filter(d => d.bodyFat)} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: 'Body Fat %', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip />
                      <defs>
                        <linearGradient id="bodyFatGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="bodyFat"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fill="url(#bodyFatGradient)"
                        name="Body Fat %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Comparison View */}
        {comparison && (
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Week Comparison</Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">This Week</Typography>
                        <Typography variant="h5" fontWeight={700}>{comparison.thisWeek.avg} kg</Typography>
                        <Typography variant="caption" color="text.secondary">{comparison.thisWeek.count} entries</Typography>
                      </Box>
                    </Stack>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Last Week</Typography>
                        <Typography variant="h5" fontWeight={700}>{comparison.lastWeek.avg} kg</Typography>
                        <Typography variant="caption" color="text.secondary">{comparison.lastWeek.count} entries</Typography>
                      </Box>
                    </Stack>
                  </Box>
                  <Divider />
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight={600}>Change</Typography>
                      <Chip
                        label={`${comparison.change > 0 ? '+' : ''}${comparison.change} kg`}
                        color={Math.abs(Number(comparison.change)) < 0.5 ? 'default' : comparison.change > 0 ? 'error' : 'success'}
                        size="small"
                      />
                    </Stack>
                  </Box>
                </Stack>
        </CardContent>
      </Card>
          </Grid>
        )}

        {/* Add Entry Section */}
        <Grid item xs={12} md={comparison ? 6 : 12}>
          <Card elevation={3}>
        <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Add Entry</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField
                  label="Weight (kg)"
                  type="number"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  fullWidth
                  InputProps={{ inputProps: { step: 0.1, min: 20, max: 300 } }}
                />
                <Button
                  variant="outlined"
                  startIcon={<StraightenIcon />}
                  onClick={() => setShowMeasurements(!showMeasurements)}
                  fullWidth
                >
                  {showMeasurements ? 'Hide' : 'Add'} Body Measurements
                </Button>
                {showMeasurements && (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Chest (cm)"
                        type="number"
                        value={measurements.chest}
                        onChange={e => setMeasurements({ ...measurements, chest: e.target.value })}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Waist (cm)"
                        type="number"
                        value={measurements.waist}
                        onChange={e => setMeasurements({ ...measurements, waist: e.target.value })}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Hips (cm)"
                        type="number"
                        value={measurements.hips}
                        onChange={e => setMeasurements({ ...measurements, hips: e.target.value })}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Arms (cm)"
                        type="number"
                        value={measurements.arms}
                        onChange={e => setMeasurements({ ...measurements, arms: e.target.value })}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Thighs (cm)"
                        type="number"
                        value={measurements.thighs}
                        onChange={e => setMeasurements({ ...measurements, thighs: e.target.value })}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Body Fat %"
                        type="number"
                        value={measurements.bodyFat}
                        onChange={e => setMeasurements({ ...measurements, bodyFat: e.target.value })}
                        fullWidth
                        size="small"
                        InputProps={{ inputProps: { step: 0.1, min: 3, max: 60 } }}
                      />
                    </Grid>
                  </Grid>
                )}
                <Button variant="contained" onClick={addEntry} fullWidth size="large" disabled={!weight}>
                  Add Entry
                </Button>
          </Stack>
        </CardContent>
      </Card>
        </Grid>
      </Grid>

      {/* Goal Dialog */}
      <Dialog open={goalDialogOpen} onClose={() => setGoalDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Set Weight Goal</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Goal Weight (kg)"
              type="number"
              value={goalWeight}
              onChange={e => setGoalWeight(e.target.value)}
              fullWidth
              InputProps={{ inputProps: { step: 0.1, min: 20, max: 300 } }}
            />
            <TextField
              label="Target Date (optional)"
              type="date"
              value={goalDate}
              onChange={e => setGoalDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
    </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGoalDialogOpen(false)}>Cancel</Button>
          <Button onClick={updateGoal} variant="contained" disabled={!goalWeight}>
            Save Goal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
