import React from 'react'
import { Card, CardContent, Typography, Tabs, Tab, Button, Stack, Chip, TextField } from '@mui/material'
import { jsPDF } from 'jspdf'
import FoodSearchDialog from '../components/FoodSearchDialog'
import RecommendationsDialog from '../components/RecommendationsDialog'
import GeneratePlanDialog from '../components/GeneratePlanDialog'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

export default function Planner() {
  const { user } = useAuth()
  const [tab, setTab] = React.useState(0)
  const [open, setOpen] = React.useState(false)
  const [openRec, setOpenRec] = React.useState(false)
  const [openGen, setOpenGen] = React.useState(false)
  const [plan, setPlan] = React.useState(null)
  const today = new Date().toISOString().slice(0,10)
  const [selectedDate, setSelectedDate] = React.useState(today)
  const [recs, setRecs] = React.useState([])
  const mealTypes = ['breakfast','lunch','dinner','snacks']

  const load = async () => {
    const data = await api.getMeals(user._id, selectedDate)
    setPlan(data)
  }

  React.useEffect(() => { if (user) load() }, [user, selectedDate])

  const addFood = async (food) => {
    const payload = { date: selectedDate, mealType: mealTypes[tab], items: [{ foodId: food._id, quantity: 1 }] }
    await api.addMeal(user._id, payload)
    setOpen(false)
    load()
  }

  const openRecommendations = async () => {
    const items = await api.recommendations(user._id, selectedDate, 12)
    setRecs(items)
    setOpenRec(true)
  }

  const onGenerate = async ({ startDate, span, sources }) => {
    // Call backend generate endpoint
    await fetch(`${import.meta.env.VITE_API_URL}/api/meals/${user._id}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ startDate, span, sources })
    })
    // Refresh today's plan after generation
    await load()
  }

  const downloadPDF = () => {
    if (!plan) return
    const doc = new jsPDF()
    let y = 14
    doc.setFontSize(16)
    doc.text('Meal Plan', 14, y)
    y += 8
    doc.setFontSize(12)
    doc.text(`Date: ${selectedDate}`, 14, y)
    y += 8
    const total = plan.totalCalories || 0
    const tp = plan.totalProtein || 0
    const tc = plan.totalCarbs || 0
    const tf = plan.totalFat || 0
    doc.text(`Totals: ${total} kcal  •  Protein ${tp}g  •  Carbs ${tc}g  •  Fat ${tf}g`, 14, y)
    y += 10
    const sections = ['breakfast','lunch','dinner','snacks']
    sections.forEach((key) => {
      const lines = formatMealLines(plan, key)
      doc.setFont(undefined, 'bold')
      doc.text(`${toTitle(key)}`, 14, y)
      y += 6
      doc.setFont(undefined, 'normal')
      if (!lines.length) {
        doc.text('- None -', 18, y)
        y += 6
      } else {
        lines.forEach(line => {
          // Wrap text if needed
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
    doc.save(`meal_plan_${selectedDate}.pdf`)
  }

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Meal Planner</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => setOpenGen(true)}>Generate Plan</Button>
            <Button variant="outlined" onClick={openRecommendations}>Get Recommendations</Button>
            <Button variant="outlined" onClick={downloadPDF} disabled={!plan}>Download PDF</Button>
            <Button variant="contained" onClick={() => setOpen(true)}>Add Food</Button>
          </Stack>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }} alignItems={{ sm: 'center' }}>
          <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} sx={{ width: { xs: '100%', sm: 220 } }} />
          <Typography variant="body2" color="text.secondary">Select a date to view and edit meals for that day.</Typography>
        </Stack>
        <Tabs value={tab} onChange={(_,v)=>setTab(v)} sx={{ mt: 2 }}>
          <Tab label="Breakfast" /><Tab label="Lunch" /><Tab label="Dinner" /><Tab label="Snacks" />
        </Tabs>
        <Stack spacing={1} sx={{ mt:2 }}>
          {(plan?.meals?.[mealTypes[tab]] || []).map((item, idx) => (
            <Chip key={idx} label={`${item.quantity}× ${item.servingSize?.amount||''}${item.servingSize?.unit||''} ${item.food?.name||''} • ${item.calories} kcal`} />
          ))}
        </Stack>
      </CardContent>
      <FoodSearchDialog open={open} onClose={()=>setOpen(false)} onSelect={addFood} />
      <RecommendationsDialog open={openRec} onClose={()=>setOpenRec(false)} items={recs} onAdd={(f)=>{ addFood(f); setOpenRec(false); }} />
      <GeneratePlanDialog open={openGen} onClose={()=>setOpenGen(false)} onGenerate={onGenerate} />
    </Card>
  )
}

function formatMealLines(plan, mealKey) {
  const items = plan?.meals?.[mealKey] || []
  return items.map(i => `${i.quantity}x ${i.food?.name || ''} (${i.servingSize?.amount||''}${i.servingSize?.unit||''}) - ${i.calories} kcal, P${i.protein} C${i.carbs} F${i.fat}`)
}

function toTitle(s) { return s.charAt(0).toUpperCase() + s.slice(1) }

// downloadPDF implemented inside component to access state
