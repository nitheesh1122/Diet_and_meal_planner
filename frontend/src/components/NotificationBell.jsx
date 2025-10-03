import React from 'react'
import { Badge, IconButton, Tooltip } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { useNotifications } from '../context/NotificationContext'

export default function NotificationBell() {
  const { unreadCount, setDrawerOpen } = useNotifications()
  return (
    <Tooltip title="Notifications">
      <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
        <Badge color="secondary" badgeContent={unreadCount} max={9} overlap="circular">
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  )
}
