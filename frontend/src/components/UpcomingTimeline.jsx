import React from 'react'
import { Card, CardContent, Typography, List, ListItem, ListItemText, Chip, Stack } from '@mui/material'

export default function UpcomingTimeline({ plan }) {
  const meals = plan?.meals || {}
  const order = ['breakfast', 'lunch', 'dinner', 'snacks']

  const items = order.flatMap((key) => {
    const arr = meals[key] || []
    return arr.map((item) => ({
      mealType: key,
      name: item.food?.name || 'Food',
      kcal: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      serving: `${item.servingSize?.amount || ''}${item.servingSize?.unit || ''}`
    }))
  })

  return (
    <Card sx={{ p: 1.5, height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">Upcoming Meals</Typography>
        <List>
          {items.length === 0 && (
            <Typography variant="body2" color="text.secondary">No items planned for today.</Typography>
          )}
          {items.map((it, idx) => (
            <ListItem key={idx} divider>
              <ListItemText
                primary={`${capitalize(it.mealType)} • ${it.name}`}
                secondary={
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Chip size="small" label={`${it.kcal} kcal`} />
                    <Chip size="small" label={`P ${it.protein}g`} />
                    <Chip size="small" label={`C ${it.carbs}g`} />
                    <Chip size="small" label={`F ${it.fat}g`} />
                    {it.serving && <Chip size="small" label={it.serving} />}
                  </Stack>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}

function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1) }
