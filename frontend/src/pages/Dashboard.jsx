import React from 'react'
import { Grid, Card, CardContent, Typography, LinearProgress, Stack, Box } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

export default function Dashboard() {
  const { user } = useAuth()
  const [today, setToday] = React.useState(null)

  React.useEffect(() => {
    const load = async () => {
      const data = await api.getMeals(user._id, new Date().toISOString().slice(0,10))
      setToday(data)
    }
    if (user) load()
  }, [user])

  const total = today ? today.totalCalories : 0
  const goal = user?.dailyCalorieGoal || 2000
  const pct = Math.min(100, Math.round((total / goal) * 100))

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card sx={{
          background: 'linear-gradient(135deg, rgba(25,118,210,0.12) 0%, rgba(123,31,162,0.12) 100%)',
          border: '1px solid', borderColor: 'divider'
        }}>
          <CardContent>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Welcome{user?.name ? `, ${user.name}` : ''} 👋
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your meals, calories and progress. Stay consistent!
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card sx={{ p: 1.5 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">Today's Calories</Typography>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="h4" fontWeight={800}>{total}</Typography>
              <Typography variant="body2" color="text.secondary">Goal {goal} kcal</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={pct} sx={{ mt: 1.5, height: 10, borderRadius: 10 }} />
            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
              <ChipStat label="Protein" value={today?.totalProtein || 0} unit="g" target={user?.dailyProteinGoal || 0} color="#4caf50" />
              <ChipStat label="Carbs" value={today?.totalCarbs || 0} unit="g" target={user?.dailyCarbsGoal || 0} color="#ff9800" />
              <ChipStat label="Fat" value={today?.totalFat || 0} unit="g" target={user?.dailyFatGoal || 0} color="#f44336" />
            </Stack>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 1.5 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">Today's Summary</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 1 }}>
              <MiniStat title="Breakfast Items" value={(today?.meals?.breakfast?.length)||0} />
              <MiniStat title="Lunch Items" value={(today?.meals?.lunch?.length)||0} />
              <MiniStat title="Dinner Items" value={(today?.meals?.dinner?.length)||0} />
              <MiniStat title="Snacks Items" value={(today?.meals?.snacks?.length)||0} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

function ChipStat({ label, value, unit, target, color }) {
  const pct = target ? Math.min(100, Math.round((value/target)*100)) : 0
  return (
    <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', flex: 1 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography variant="h6" fontWeight={700}>{value}{unit}</Typography>
        <Typography variant="caption" color="text.secondary">{pct}%</Typography>
      </Stack>
      <Box sx={{ height: 6, borderRadius: 6, backgroundColor: '#e0e0e0' }}>
        <Box sx={{ height: 6, borderRadius: 6, width: `${pct}%`, backgroundColor: color }} />
      </Box>
    </Box>
  )
}

function MiniStat({ title, value }) {
  return (
    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary">{title}</Typography>
      <Typography variant="h5" fontWeight={800}>{value}</Typography>
    </Box>
  )
}
