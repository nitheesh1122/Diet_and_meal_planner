import React from 'react'
import { Card, CardContent, Typography, List, ListItem, ListItemText, Stack, TextField, Button } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

export default function GroceryList() {
  const { user } = useAuth()
  const today = new Date()
  const iso = (d) => d.toISOString().slice(0,10)
  const [startDate, setStartDate] = React.useState(iso(today))
  const [endDate, setEndDate] = React.useState(iso(today))
  const [items, setItems] = React.useState([])

  const load = async () => {
    if (!user) return
    const res = await axios.get(`/api/grocery/${user._id}`, { params: { startDate, endDate } })
    setItems(res.data.data.items || [])
  }

  React.useEffect(() => { load() }, [user])

  const exportCSV = () => {
    const header = 'Item,Amount,Unit\n'
    const rows = items.map(i => `${escapeCSV(i.name)},${i.amount},${i.unit}`).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `grocery_${startDate}_to_${endDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const escapeCSV = (s) => `"${String(s).replace(/"/g,'""')}"`

  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Typography variant="h6">Grocery List</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField type="date" label="Start" InputLabelProps={{ shrink: true }} value={startDate} onChange={e=>setStartDate(e.target.value)} />
            <TextField type="date" label="End" InputLabelProps={{ shrink: true }} value={endDate} onChange={e=>setEndDate(e.target.value)} />
            <Button variant="outlined" onClick={load}>Refresh</Button>
            <Button variant="contained" onClick={exportCSV} disabled={!items.length}>Export CSV</Button>
          </Stack>
        </Stack>
        <List sx={{ mt: 2 }}>
          {items.map((i, idx) => (
            <ListItem key={idx} divider>
              <ListItemText primary={i.name} secondary={`Amount: ${Math.round(i.amount)} ${i.unit}`} />
            </ListItem>
          ))}
          {!items.length && (
            <Typography variant="body2" color="text.secondary">No items in this range. Try generating meals or adding foods in Planner.</Typography>
          )}
        </List>
      </CardContent>
    </Card>
  )
}
