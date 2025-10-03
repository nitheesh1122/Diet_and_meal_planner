import React from 'react'
import { Dialog, DialogTitle, DialogContent, TextField, List, ListItemButton, ListItemText, CircularProgress, InputAdornment, Stack, FormControlLabel, Switch, MenuItem } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { api } from '../utils/api'

export default function FoodSearchDialog({ open, onClose, onSelect, mealType, goal }) {
  const [q, setQ] = React.useState('')
  const [foods, setFoods] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const debounceRef = React.useRef()
  const [category, setCategory] = React.useState('all')
  const [verifiedOnly, setVerifiedOnly] = React.useState(true)
  const [tagsText, setTagsText] = React.useState('')

  React.useEffect(() => {
    let active = true
    if (!open) return
    setLoading(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const tags = tagsText.trim() ? tagsText.split(',').map(s=>s.trim()).filter(Boolean) : undefined
        const data = await api.foods({ q, mealType, goal, category, tags, verified: verifiedOnly })
        if (active) setFoods(data)
      } finally {
        if (active) setLoading(false)
      }
    }, 300)
    return () => { active = false }
  }, [q, open, mealType, goal, category, verifiedOnly, tagsText])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Search Food</DialogTitle>
      <DialogContent>
        <TextField fullWidth autoFocus margin="dense" label="Search" value={q} onChange={e=>setQ(e.target.value)} 
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
          <TextField select label="Category" value={category} onChange={(e)=> setCategory(e.target.value)} sx={{ minWidth: 180 }}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="protein">Protein</MenuItem>
            <MenuItem value="grains">Grains</MenuItem>
            <MenuItem value="fruits">Fruits</MenuItem>
            <MenuItem value="vegetables">Vegetables</MenuItem>
            <MenuItem value="dairy">Dairy</MenuItem>
            <MenuItem value="beverages">Beverages</MenuItem>
            <MenuItem value="sweets">Sweets</MenuItem>
            <MenuItem value="fats">Fats</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField label="Tags (comma separated)" value={tagsText} onChange={(e)=> setTagsText(e.target.value)} sx={{ flex: 1 }} />
          <FormControlLabel control={<Switch checked={verifiedOnly} onChange={(e)=> setVerifiedOnly(e.target.checked)} />} label="Verified only" />
        </Stack>
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
