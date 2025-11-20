import React from 'react'
import {
  Box, List, ListItem, ListItemText, Typography, IconButton, Tooltip, Badge,
  Collapse, Divider, Button, Paper
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import DoneIcon from '@mui/icons-material/Done'
import { useNotifications } from '../context/NotificationContext'

export default function SidebarNotifications({ isCollapsed }) {
  const { notifications, unreadCount, markRead, markAllRead, setDrawerOpen } = useNotifications()
  const [expanded, setExpanded] = React.useState(true)
  const [localNotifications, setLocalNotifications] = React.useState(notifications)

  React.useEffect(() => {
    setLocalNotifications(notifications)
  }, [notifications])

  const handleToggle = () => {
    setExpanded(!expanded)
  }

  const handleMarkRead = (id, e) => {
    e.stopPropagation()
    markRead(id)
  }

  const handleMarkAllRead = (e) => {
    e.stopPropagation()
    markAllRead()
  }

  const handleOpenFullDrawer = () => {
    setDrawerOpen(true)
  }

  if (isCollapsed) {
    return (
      <Box sx={{ px: 1, py: 1 }}>
        <Tooltip title={`${unreadCount} unread notifications`} placement="right" arrow>
          <IconButton
            onClick={handleOpenFullDrawer}
            sx={{
              width: '100%',
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>
      </Box>
    )
  }

  return (
    <Box sx={{ px: 1.5, py: 1 }}>
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            bgcolor: unreadCount > 0 ? 'primary.50' : 'transparent',
            transition: 'background-color 0.2s',
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              flex: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover',
                borderRadius: 1,
              },
              p: 0.5,
              transition: 'background-color 0.2s',
            }}
            onClick={handleToggle}
          >
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsIcon color={unreadCount > 0 ? 'primary' : 'action'} />
            </Badge>
            <Typography variant="subtitle2" fontWeight={600}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Typography variant="caption" color="primary.main" fontWeight={700}>
                ({unreadCount})
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {unreadCount > 0 && (
              <Tooltip title="Mark all as read">
                <IconButton
                  size="small"
                  onClick={handleMarkAllRead}
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'primary.50',
                    },
                  }}
                >
                  <DoneIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton size="small" onClick={handleToggle}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {/* Notifications List */}
        <Collapse in={expanded}>
          <Divider />
          <Box
            sx={{
              maxHeight: 400,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '3px',
              },
            }}
          >
            {localNotifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications
                </Typography>
              </Box>
            ) : (
              <>
                {localNotifications.slice(0, 5).map((notification) => (
                  <ListItem
                    key={notification.id}
                    sx={{
                      py: 1.5,
                      px: 1.5,
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      borderLeft: notification.read ? 'none' : '3px solid',
                      borderLeftColor: 'primary.main',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    secondaryAction={
                      !notification.read && (
                        <Tooltip title="Mark as read">
                          <IconButton
                            edge="end"
                            size="small"
                            onClick={(e) => handleMarkRead(notification.id, e)}
                          >
                            <DoneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )
                    }
                  >
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          fontWeight={notification.read ? 400 : 600}
                          sx={{ mb: 0.5 }}
                        >
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            {notification.body}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {new Date(notification.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
                {localNotifications.length > 5 && (
                  <>
                    <Divider />
                    <Box sx={{ p: 1.5, textAlign: 'center' }}>
                      <Button
                        size="small"
                        variant="text"
                        onClick={handleOpenFullDrawer}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        View all ({localNotifications.length})
                      </Button>
                    </Box>
                  </>
                )}
                {unreadCount > 0 && (
                  <>
                    <Divider />
                    <Box sx={{ p: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        onClick={handleMarkAllRead}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Mark all read
                      </Button>
                    </Box>
                  </>
                )}
              </>
            )}
          </Box>
        </Collapse>
      </Paper>
    </Box>
  )
}

