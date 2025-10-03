import React from 'react'
import { Card, CardContent, Typography, Stack, TextField, Button } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

export default function Progress() {
  const { user } = useAuth()
  const [progress, setProgress] = React.useState(null)
  const [weight, setWeight] = React.useState('')

  const load = async () => {
    const data = await api.getProgress(user._id)
    setProgress(data)
  }

  React.useEffect(() => { if (user) load() }, [user])

  const addEntry = async () => {
    if (!weight) return
    await api.addProgress(user._id, { weight: Number(weight), date: new Date().toISOString() })
    setWeight('')
    load()
  }

  const chartData = (progress?.entries || []).map(e => ({ date: new Date(e.date).toLocaleDateString(), weight: e.weight }))

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Weight Progress</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Track your weight over time to monitor progress towards your goals.
          </Typography>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  label={{ value: 'Date', position: 'insideBottom', offset: -5 }} 
                />
                <YAxis 
                  label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#1976d2" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Add Entry</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Weight (kg)" type="number" value={weight} onChange={e=>setWeight(e.target.value)} />
            <Button variant="contained" onClick={addEntry}>Add</Button>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
