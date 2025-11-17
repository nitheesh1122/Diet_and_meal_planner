import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, ToggleButtonGroup, ToggleButton } from '@mui/material'

export default function GeneratePlanDialog({ open, onClose, onGenerate }) {
  const today = new Date().toISOString().slice(0,10)
  const [startDate, setStartDate] = React.useState(today)
  const [span, setSpan] = React.useState('daily')
  const [submitting, setSubmitting] = React.useState(false)

  const submit = async () => {
    setSubmitting(true)
    try {
      await onGenerate({ startDate, span, sources: ['general'] })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Generate Meal Plan</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={startDate} onChange={e=>setStartDate(e.target.value)} />
          <ToggleButtonGroup exclusive value={span} onChange={(_,v)=> v && setSpan(v)}>
            <ToggleButton value="daily">Daily</ToggleButton>
            <ToggleButton value="weekly">Weekly (7 days)</ToggleButton>
            <ToggleButton value="monthly">Monthly (30 days)</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={submitting}>Generate</Button>
      </DialogActions>
    </Dialog>
  )
}
