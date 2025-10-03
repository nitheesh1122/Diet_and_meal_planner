import React from 'react'
import { Grid, Card, CardContent, Typography, Stack } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import KpiCard from '../components/KpiCard'
import MacroDonut from '../components/MacroDonut'
import TrendChart from '../components/TrendChart'
import UpcomingTimeline from '../components/UpcomingTimeline'

export default function Dashboard() {
  const { user } = useAuth()
  const [today, setToday] = React.useState(null)
  const [trend, setTrend] = React.useState([])
  const [hydrationMl, setHydrationMl] = React.useState(() => {
    const k = `hydration_${new Date().toISOString().slice(0,10)}`
    return Number(localStorage.getItem(k) || 0)
  })

  const hydrationKey = React.useMemo(() => `hydration_${new Date().toISOString().slice(0,10)}`, [])
  React.useEffect(() => { localStorage.setItem(hydrationKey, String(hydrationMl)) }, [hydrationMl, hydrationKey])

  const load = React.useCallback(async () => {
    if (!user) return
    const todayStr = new Date().toISOString().slice(0,10)
    const data = await api.getMeals(user._id, todayStr)
    setToday(data)
    // Mock trend for now; replace with backend when available
    const d = [...Array(7)].map((_,i) => ({ day: `D-${6-i}`, kcal: Math.round(1600 + Math.random()*800) }))
    setTrend(d)
  }, [user])

  React.useEffect(() => { if (user) load() }, [user, load])
  React.useEffect(() => {
    const handler = () => { load() }
    window.addEventListener('plan-updated', handler)
    return () => window.removeEventListener('plan-updated', handler)
  }, [load])

  const total = today?.totalCalories || 0
  const goal = user?.dailyCalorieGoal || 2000
  const rem = Math.max(0, goal - total)
  const pct = Math.min(100, Math.round((total / goal) * 100))

  const tp = today?.totalProtein || 0
  const tc = today?.totalCarbs || 0
  const tf = today?.totalFat || 0
  const gp = user?.dailyProteinGoal || 0
  const gc = user?.dailyCarbsGoal || 0
  const gf = user?.dailyFatGoal || 0

  const protRem = Math.max(0, gp - tp)
  const carbRem = Math.max(0, gc - tc)
  const fatRem  = Math.max(0, gf - tf)

  // Hydration & adherence
  const hydrationGoal = user?.dailyWaterMl || 2000
  const hydrationPct = Math.min(100, Math.round((hydrationMl / hydrationGoal) * 100))
  const addWater250 = () => setHydrationMl((v) => Math.min(hydrationGoal, v + 250))

  const adherencePct = React.useMemo(() => {
    if (!trend.length) return 0
    const tol = 0.10 // ±10%
    const within = trend.filter(d => Math.abs(d.kcal - goal) <= goal * tol).length
    return Math.round((within / trend.length) * 100)
  }, [trend, goal])

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Welcome{user?.name ? `, ${user.name}` : ''} 👋
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your daily overview, macros, and upcoming meals at a glance.
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* KPI row */}
      <Grid item xs={12} md={3}><KpiCard title="Calories Remaining" value={rem} unit=" kcal" subtitle={`Consumed ${total}/${goal}`} progress={pct} actionLabel="Add snack" onAction={()=>{}} /></Grid>
      <Grid item xs={12} md={3}><KpiCard title="Protein Remaining" value={protRem} unit=" g" subtitle={`Today ${tp}/${gp}g`} progress={gp?Math.min(100,Math.round((tp/gp)*100)):0} color="success" /></Grid>
      <Grid item xs={12} md={3}><KpiCard title="Carbs Remaining" value={carbRem} unit=" g" subtitle={`Today ${tc}/${gc}g`} progress={gc?Math.min(100,Math.round((tc/gc)*100)):0} color="primary" /></Grid>
      <Grid item xs={12} md={3}><KpiCard title="Fat Remaining" value={fatRem} unit=" g" subtitle={`Today ${tf}/${gf}g`} progress={gf ? Math.min(100, Math.round((tf/gf)*100)) : 0} color="warning" /></Grid>
      <Grid item xs={12} md={3}><KpiCard title="Hydration" value={hydrationMl} unit=" ml" subtitle={`Goal ${hydrationGoal} ml`} progress={hydrationPct} color="primary" actionLabel="+250 ml" onAction={addWater250} /></Grid>
      <Grid item xs={12} md={3}><KpiCard title="Adherence (7d)" value={adherencePct} unit=" %" subtitle={`Within ±10% of goal`} progress={adherencePct} color="success" /></Grid>

      {/* Macro donut + trend */}
      <Grid item xs={12} md={6}><MacroDonut protein={tp} carbs={tc} fat={tf} /></Grid>
      <Grid item xs={12} md={6}><TrendChart data={trend} title="Calories Trend (7d)" /></Grid>

      {/* Upcoming meals */}
      <Grid item xs={12}><UpcomingTimeline plan={today} /></Grid>
    </Grid>
  )
}
