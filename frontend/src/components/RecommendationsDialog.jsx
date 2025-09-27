import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItemButton, ListItemText, Chip, Stack, Typography } from '@mui/material'

export default function RecommendationsDialog({ open, onClose, items, onAdd }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Recommended Foods</DialogTitle>
      <DialogContent>
        {items && items.length > 0 ? (
          <List>
            {items.map((f) => (
              <ListItemButton key={f._id || f.name} onClick={() => onAdd(f)}>
                <ListItemText
                  primary={f.name}
                  secondary={
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip size="small" label={`${f.calories} kcal`} />
                      <Chip size="small" color="success" label={`P ${f.protein}g`} />
                      <Chip size="small" color="warning" label={`C ${f.carbs}g`} />
                      <Chip size="small" color="error" label={`F ${f.fat}g`} />
                    </Stack>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">No recommendations available.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
