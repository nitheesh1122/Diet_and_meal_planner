import React from 'react'
import { Dialog, DialogTitle, DialogContent, TextField, List, ListItemButton, ListItemText, CircularProgress, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { api } from '../utils/api'

export default function FoodSearchDialog({ open, onClose, onSelect }) {
  const [q, setQ] = React.useState('')
  const [foods, setFoods] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const debounceRef = React.useRef()

  React.useEffect(() => {
    let active = true
    if (!open) return
    setLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.foods(q)
        if (active) setFoods(data)
      } finally {
        if (active) setLoading(false)
      }
    }, 300)
    return () => { active = false }
  }, [q, open])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Search Food</DialogTitle>
      <DialogContent>
        <TextField fullWidth autoFocus margin="dense" label="Search" value={q} onChange={e=>setQ(e.target.value)} 
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
        {loading ? <CircularProgress size={24} sx={{ mt:2 }} /> : (
          <List>
            {foods.map((f) => (
              <ListItemButton key={f._id || f.name} onClick={() => onSelect(f)}>
                <ListItemText primary={f.name} secondary={`${f.calories} kcal • Protein ${f.protein}g • Carbs ${f.carbs}g • Fat ${f.fat}g`} />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  )
}
