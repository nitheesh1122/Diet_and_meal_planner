import React from 'react'
import {
  Box, Divider, Drawer, IconButton, List, ListItem, ListItemText, Typography, Tooltip, Button
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DoneIcon from '@mui/icons-material/Done'
import { useNotifications } from '../context/NotificationContext'

export default function NotificationDrawer() {
  const { drawerOpen, setDrawerOpen, notifications, markRead, markAllRead } = useNotifications()

  return (
    <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
      <Box sx={{ width: 360, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" fontWeight={800}>Notifications</Typography>
          <Box>
            <Button size="small" onClick={markAllRead}>Mark all read</Button>
            <Tooltip title="Close">
              <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Divider />
        <List sx={{ flex: 1, overflowY: 'auto' }}>
          {notifications.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">No notifications yet.</Typography>
            </Box>
          )}
          {notifications.map(n => (
            <ListItem key={n.id} alignItems="flex-start" secondaryAction={
              !n.read && (
                <Tooltip title="Mark read"><IconButton edge="end" onClick={() => markRead(n.id)}><DoneIcon /></IconButton></Tooltip>
              )
            }>
              <ListItemText
                primary={<Typography variant="subtitle1" fontWeight={700}>{n.title}</Typography>}
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">{n.body}</Typography>
                    <Typography variant="caption" color="text.disabled">{new Date(n.createdAt).toLocaleString()}</Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}
