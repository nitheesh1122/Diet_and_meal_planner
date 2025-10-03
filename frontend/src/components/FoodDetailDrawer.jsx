import React from 'react'
import { Drawer, Box, Typography, Stack, Chip, Divider, TextField, MenuItem, Button } from '@mui/material'

const mealTypes = ['breakfast','lunch','dinner','snacks']

export default function FoodDetailDrawer({ open, onClose, food, onAdd }) {
  const [amount, setAmount] = React.useState(food?.servingSize?.amount || 100)
  const unit = food?.servingSize?.unit || 'g'

  React.useEffect(() => {
    if (food?.servingSize?.amount) setAmount(food.servingSize.amount)
  }, [food])

  if (!food) return null

  const baseAmt = food.servingSize?.amount || 100
  const factor = amount && baseAmt ? (amount / baseAmt) : 1

  const cal = Math.max(0, Math.round((food.calories || 0) * factor))
  const prot = Math.max(0, Math.round((food.protein || 0) * factor))
  const carbs = Math.max(0, Math.round((food.carbs || 0) * factor))
  const fat = Math.max(0, Math.round((food.fat || 0) * factor))
  const sugar = Math.max(0, Math.round((food.sugar || 0) * factor))
  const sodium = Math.max(0, Math.round((food.sodium || 0) * factor))
  const fiber = Math.max(0, Math.round((food.fiber || 0) * factor))

  const addToMeal = (mealType) => {
    // Build payload shape consumed by Planner page
    onAdd?.({
      mealType,
      foodId: food._id,
      quantity: 1,
      servingSize: { amount, unit },
      calories: cal,
      protein: prot,
      carbs,
      fat
    })
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 380, p: 2 }}>
        <Typography variant="h6" fontWeight={800}>{food.name}</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
          {food.category && <Chip size="small" label={capitalize(food.category)} />}
          {(food.tags||[]).slice(0,3).map((t, i) => (<Chip key={i} size="small" variant="outlined" label={t} />))}
          {food.isVerified && <Chip size="small" color="success" label="Verified" />}
        </Stack>
        {food.source && (
          <Typography variant="caption" color="text.secondary" sx={{ display:'block', mt: 0.5 }}>Source: {food.source}</Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary">Serving</Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <TextField type="number" size="small" label="Amount" value={amount}
            onChange={(e)=> setAmount(Math.max(1, Number(e.target.value)))} sx={{ width: 120 }} />
          <TextField size="small" label="Unit" value={unit} sx={{ width: 120 }} select disabled>
            <MenuItem value={unit}>{unit}</MenuItem>
          </TextField>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
          <Chip label={`${cal} kcal`} />
          <Chip label={`P ${prot}g`} />
          <Chip label={`C ${carbs}g`} />
          <Chip label={`F ${fat}g`} />
          <Chip label={`Sugar ${sugar}g`} />
          <Chip label={`Sodium ${sodium}mg`} />
          <Chip label={`Fiber ${fiber}g`} />
        </Stack>

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" color="text.secondary">Add to meal</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
          {mealTypes.map((m) => (
            <Button key={m} variant="contained" size="small" onClick={()=> addToMeal(m)}>{capitalize(m)}</Button>
          ))}
        </Stack>
      </Box>
    </Drawer>
  )
}

function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1) }
