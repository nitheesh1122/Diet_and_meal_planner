import React from 'react'
import { Card, CardContent, Typography, LinearProgress, Stack, Button } from '@mui/material'

export default function KpiCard({ title, value, unit, subtitle, progress = null, color = 'primary', actionLabel, onAction }) {
  return (
    <Card sx={{ p: 1.5 }}>
      <CardContent>
        <Typography variant="caption" color="text.secondary">{title}</Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mt: 0.5 }}>
          <Typography variant="h4" fontWeight={800}>{value}{unit || ''}</Typography>
          {actionLabel && <Button size="small" variant="text" onClick={onAction}>{actionLabel}</Button>}
        </Stack>
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
        {progress !== null && (
          <LinearProgress variant="determinate" value={progress} color={color} sx={{ mt: 1.5, height: 8, borderRadius: 8 }} />
        )}
      </CardContent>
    </Card>
  )
}
