import React from 'react'
import { Card, CardContent, Typography, List, ListItem, ListItemText, Stack, TextField, Button, IconButton, Tooltip, Divider, FormControl, Select, MenuItem, InputLabel, Box, Chip } from '@mui/material'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { useNotifications } from '../context/NotificationContext'
import jsPDF from 'jspdf'

export default function GroceryList() {
  const { user } = useAuth()
  const { scheduleReminder, addNotification, toISTDate } = useNotifications()
  const today = new Date()
  const iso = (d) => d.toISOString().slice(0,10)
  const [startDate, setStartDate] = React.useState(iso(today))
  const [endDate, setEndDate] = React.useState(iso(today))
  const [items, setItems] = React.useState([])
  const [grouped, setGrouped] = React.useState({})
  const [reminderTime, setReminderTime] = React.useState('18:00') // Default 6:00 PM
  const [reminderType, setReminderType] = React.useState('preset') // 'preset' or 'custom'

  const load = async () => {
    if (!user) return
    const res = await axios.get(`/api/grocery/${user._id}`, { params: { startDate, endDate } })
    setItems(res.data.data.items || [])
    setGrouped(res.data.data.grouped || {})
  }

  React.useEffect(() => { load() }, [user, startDate, endDate])
  React.useEffect(() => {
    const handler = () => load()
    window.addEventListener('plan-updated', handler)
    return () => window.removeEventListener('plan-updated', handler)
  }, [startDate, endDate, user])

  const getISTTime = (hours, minutes = 0) => {
    const istNow = toISTDate(new Date())
    const when = new Date(istNow)
    when.setHours(hours, minutes, 0, 0)
    // If the time has passed today, schedule for tomorrow
    if (when < new Date()) {
      when.setDate(when.getDate() + 1)
    }
    return when
  }

  const getRelativeTime = (hoursFromNow) => {
    const istNow = toISTDate(new Date())
    const when = new Date(istNow.getTime() + (hoursFromNow * 60 * 60 * 1000))
    return when
  }

  const presetTimes = [
    { label: 'Now', value: 'now', getTime: () => getRelativeTime(0) },
    { label: 'In 30 minutes', value: '30min', getTime: () => getRelativeTime(0.5) },
    { label: 'In 1 hour', value: '1hour', getTime: () => getRelativeTime(1) },
    { label: 'In 2 hours', value: '2hours', getTime: () => getRelativeTime(2) },
    { label: '6:00 PM IST', value: '18:00', getTime: () => getISTTime(18, 0) },
    { label: '8:00 PM IST', value: '20:00', getTime: () => getISTTime(20, 0) },
    { label: 'Custom Time', value: 'custom', getTime: null }
  ]

  const getSelectedTime = () => {
    if (reminderType === 'preset') {
      const preset = presetTimes.find(p => p.value === reminderTime)
      return preset ? preset.getTime() : getISTTime(18, 0)
    } else {
      // Custom time - parse HH:MM format
      const [hours, minutes] = reminderTime.split(':').map(Number)
      return getISTTime(hours, minutes)
    }
  }

  const remindItem = (item) => {
    const when = getSelectedTime()
    scheduleReminder({ itemId: item.name, title: `${item.name} needs to be purchased.`, whenIST: when })
    addNotification({
      title: 'Reminder scheduled',
      body: `${item.name} at ${when.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST`
    })
  }

  const remindAllToday = () => {
    if (!items.length) return
    const when = getSelectedTime()
    items.forEach((i) => scheduleReminder({ itemId: i.name, title: `${i.name} needs to be purchased.`, whenIST: when }))
    addNotification({
      title: 'Reminders scheduled',
      body: `All ${items.length} items at ${when.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST`
    })
  }

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

  const exportPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    let yPosition = margin

    // Title
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    const title = 'Grocery List'
    const titleWidth = doc.getTextWidth(title)
    doc.text(title, (pageWidth - titleWidth) / 2, yPosition)
    yPosition += 20

    // Date range
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const dateRange = `${startDate} to ${endDate}`
    const dateWidth = doc.getTextWidth(dateRange)
    doc.text(dateRange, (pageWidth - dateWidth) / 2, yPosition)
    yPosition += 15

    // Group categories
    Object.entries(grouped).forEach(([category, items]) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = margin
      }

      // Category header
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(`${titleCase(category)} (${items.length} items)`, margin, yPosition)
      yPosition += 10

      // Items
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      items.forEach((item, index) => {
        const itemText = `${index + 1}. ${item.name} - ${item.amount} ${item.unit}`
        const lines = doc.splitTextToSize(itemText, pageWidth - 2 * margin)

        // Check if we need a new page for this item
        if (yPosition + lines.length * 5 > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }

        doc.text(lines, margin, yPosition)
        yPosition += lines.length * 5 + 3
      })

      yPosition += 5 // Extra space between categories
    })

    // Footer
    const footerY = pageHeight - 10
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    const footerText = `Generated on ${new Date().toLocaleDateString()} | Total items: ${items.length}`
    const footerWidth = doc.getTextWidth(footerText)
    doc.text(footerText, (pageWidth - footerWidth) / 2, footerY)

    // Save the PDF
    doc.save(`grocery_${startDate}_to_${endDate}.pdf`)
  }

  const escapeCSV = (s) => `"${String(s).replace(/"/g,'""')}"`

  return (
    <Card>
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Typography variant="h6">Grocery List</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
            <TextField type="date" label="Start" InputLabelProps={{ shrink: true }} value={startDate} onChange={e=>setStartDate(e.target.value)} />
            <TextField type="date" label="End" InputLabelProps={{ shrink: true }} value={endDate} onChange={e=>setEndDate(e.target.value)} />
            <Button variant="outlined" onClick={load}>Refresh</Button>
            <Button variant="contained" onClick={exportCSV} disabled={!items.length} startIcon={<NotificationsActiveIcon />}>Export CSV</Button>
            <Button variant="contained" onClick={exportPDF} disabled={!items.length} startIcon={<PictureAsPdfIcon />}>Export PDF</Button>
          </Stack>
        </Stack>

        {/* Reminder Time Selection */}
        <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom>Reminder Settings</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Time Option</InputLabel>
              <Select
                value={reminderType}
                onChange={(e) => setReminderType(e.target.value)}
                label="Time Option"
              >
                <MenuItem value="preset">Preset Times</MenuItem>
                <MenuItem value="custom">Custom Time</MenuItem>
              </Select>
            </FormControl>

            {reminderType === 'preset' ? (
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Preset Time</InputLabel>
                <Select
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  label="Preset Time"
                >
                  {presetTimes.map((preset) => (
                    <MenuItem key={preset.value} value={preset.value}>
                      {preset.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <TextField
                type="time"
                label="Custom Time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
              />
            )}

            <Button variant="contained" color="secondary" onClick={remindAllToday} disabled={!items.length} startIcon={<NotificationsActiveIcon />}>
              Remind All
            </Button>
          </Stack>
        </Box>

        {/* Grouped by category */}
        {Object.keys(grouped).length ? (
          Object.entries(grouped).map(([cat, arr]) => (
            <Card key={cat} variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>{titleCase(cat)} ({arr.length} items)</Typography>
                <List>
                  {arr.map((i, idx) => (
                    <ListItem key={`${cat}-${idx}`} divider secondaryAction={
                      <Tooltip title={`Remind at ${getSelectedTime().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })} IST`}>
                        <IconButton edge="end" onClick={() => remindItem(i)}>
                          <NotificationsActiveIcon />
                        </IconButton>
                      </Tooltip>
                    }>
                      <ListItemText primary={i.name} secondary={`Amount: ${i.amount} ${i.unit}`} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No items in this range. Try generating meals or adding foods in Planner.</Typography>
        )}
      </CardContent>
    </Card>
  )
}

function titleCase(s){ return String(s||'').split(/[_\s-]+/).map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ') }
