import React from 'react'
import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

export default function MacroBar() {
  const { user } = useAuth()
  const [today, setToday] = React.useState(null)

  const load = React.useCallback(async () => {
    if (!user) return
    const date = new Date().toISOString().slice(0,10)
    const plan = await api.getMeals(user._id, date)
    setToday(plan)
  }, [user])

  React.useEffect(() => { load() }, [load])

  React.useEffect(() => {
    const handler = () => { load() }
    window.addEventListener('plan-updated', handler)
    return () => window.removeEventListener('plan-updated', handler)
  }, [load])

  if (!user) return null

  const p = today?.totalProtein || 0
  const c = today?.totalCarbs || 0
  const f = today?.totalFat || 0
  const pg = user?.dailyProteinGoal || 0
  const cg = user?.dailyCarbsGoal || 0
  const fg = user?.dailyFatGoal || 0

  const ratio = (val, goal) => goal ? Math.min(100, Math.round((val/goal)*100)) : 0

  return (
    <Box sx={{ position: 'sticky', top: 64, zIndex: 100, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 1.5 }}>
        <Stat label="Protein" value={`${p}g`} pct={ratio(p, pg)} color="#2e7d32" />
        <Stat label="Carbs" value={`${c}g`} pct={ratio(c, cg)} color="#ff9800" />
        <Stat label="Fat" value={`${f}g`} pct={ratio(f, fg)} color="#f44336" />
      </Stack>
    </Box>
  )
}

function Stat({ label, value, pct, color }) {
  return (
    <Box sx={{ flex: 1 }}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="caption" color="text.secondary">{pct}%</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 8, [`& .MuiLinearProgress-bar`]: { backgroundColor: color } }} />
      <Typography variant="caption" color="text.secondary">{value}</Typography>
    </Box>
  )
}
