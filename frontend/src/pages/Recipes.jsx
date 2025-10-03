import React from 'react'
import { Card, CardContent, Typography, Stack, Button, Grid, Chip } from '@mui/material'
import { jsPDF } from 'jspdf'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

const MEAL_TYPES = ['breakfast','lunch','dinner','snacks']

export default function Recipes() {
  const { user } = useAuth()
  const [date, setDate] = React.useState(() => new Date().toISOString().slice(0,10))
  const [plan, setPlan] = React.useState(null)

  React.useEffect(() => {
    const load = async () => {
      if (!user) return
      const data = await api.getMeals(user._id, date)
      setPlan(data)
    }
    load()
  }, [user, date])

  const exportPDF = () => {
    if (!plan) return
    const doc = new jsPDF({ unit: 'pt' })
    let y = 40
    doc.setFontSize(18)
    doc.text(`Recipes — ${date}`, 40, y)
    y += 14
    doc.setFontSize(12)

    for (const t of MEAL_TYPES) {
      const items = plan?.meals?.[t] || []
      if (!items.length) continue
      y += 16
      doc.setFont(undefined, 'bold')
      doc.text(capitalize(t), 40, y)
      doc.setFont(undefined, 'normal')
      y += 10
      for (const it of items) {
        const line = `${it.food?.name || ''} — ${fmtServing(it.servingSize)} — ${it.calories} kcal`
        const steps = buildSteps(it)
        const ingredients = buildIngredients(it)
        const text = [`• ${line}`, '  Ingredients:', ...ingredients.map(s=>`   - ${s}`), '  Steps:', ...steps.map((s,i)=>`   ${i+1}. ${s}`)]
        const chunk = doc.splitTextToSize(text.join('\n'), 520)
        for (const row of chunk) {
          if (y > 760) { doc.addPage(); y = 40 }
          doc.text(row, 40, y)
          y += 14
        }
        y += 6
      }
    }

    doc.save(`recipes_${date}.pdf`)
  }

  const itemsByMeal = (type) => plan?.meals?.[type] || []

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Recipes</Typography>
        <input type="date" value={date} onChange={(e)=> setDate(e.target.value)} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} />
        <Button variant="contained" onClick={exportPDF} disabled={!plan}>Export PDF</Button>
      </Stack>

      {MEAL_TYPES.map((t) => (
        <Card key={t}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>{capitalize(t)}</Typography>
            <Grid container spacing={2}>
              {itemsByMeal(t).map((it, idx) => (
                <Grid item xs={12} md={6} key={`${t}-${idx}`}>
                  <RecipeCard item={it} />
                </Grid>
              ))}
              {itemsByMeal(t).length === 0 && (
                <Grid item xs={12}><Typography variant="body2" color="text.secondary">No items.</Typography></Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}

function RecipeCard({ item }) {
  const name = item.food?.name || 'Food'
  const ingredients = buildIngredients(item)
  const steps = buildSteps(item)
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1" fontWeight={700}>{name}</Typography>
          <Stack direction="row" spacing={1}>
            <Chip size="small" label={`${item.calories} kcal`} />
            <Chip size="small" label={`P ${item.protein}g`} />
            <Chip size="small" label={`C ${item.carbs}g`} />
            <Chip size="small" label={`F ${item.fat}g`} />
            <Chip size="small" label={fmtServing(item.servingSize)} />
          </Stack>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>Ingredients</Typography>
          <ul style={{ marginTop: 4 }}>
            {ingredients.map((s, i) => (<li key={i}><Typography variant="body2">{s}</Typography></li>))}
          </ul>
          <Typography variant="subtitle2">Steps</Typography>
          <ol style={{ marginTop: 4 }}>
            {steps.map((s, i) => (<li key={i}><Typography variant="body2">{s}</Typography></li>))}
          </ol>
        </Stack>
      </CardContent>
    </Card>
  )
}

function buildIngredients(it) {
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
