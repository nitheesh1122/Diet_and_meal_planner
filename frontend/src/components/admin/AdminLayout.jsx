import React from 'react'
import {
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Box, Tooltip, Typography
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import LogoutIcon from '@mui/icons-material/Logout'
import Logo from '../Logo'

const drawerWidth = 280
const drawerWidthCollapsed = 64

const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/admin/users', label: 'Users', icon: <PeopleIcon /> },
]

export default function AdminLayout({ children }) {
    const location = useLocation()
    const navigate = useNavigate()
    const { adminProfile, logoutAdmin } = useAuth()
    const [expanded, setExpanded] = React.useState(false)

    const handleLogout = () => {
        logoutAdmin()
        navigate('/admin/login')
    }

    const drawerContent = (isCollapsed) => (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: isCollapsed ? 2 : 3,
                    background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', // Different gradient for Admin
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    minHeight: 64,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        opacity: isCollapsed ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        pointerEvents: 'none',
                    }}
                >
                    <Logo variant="icon" size="small" collapsed={true} />
                </Box>
                <Box
                    sx={{
                        opacity: isCollapsed ? 0 : 1,
                        width: isCollapsed ? 0 : 'auto',
                        overflow: 'hidden',
                        transition: 'opacity 0.2s ease, width 0.3s ease',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Logo variant="full" size="small" />
                        {adminProfile && !isCollapsed && (
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                                {adminProfile.name} · {adminProfile.role === 'super' ? 'Super Admin' : 'Admin'}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>

            <Divider />

            {/* Menu Items */}
            <List sx={{ flexGrow: 1, pt: 2, px: isCollapsed ? 0.5 : 1.5 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    const button = (
                        <ListItemButton
                            onClick={() => {
                                navigate(item.path)
                            }}
                            sx={{
                                borderRadius: 2,
                                bgcolor: isActive ? 'primary.main' : 'transparent',
                                color: isActive ? 'white' : 'text.primary',
                                minHeight: 48,
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                px: isCollapsed ? 1 : 2,
                                '&:hover': {
                                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                                },
                                transition: 'all 0.2s',
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: isActive ? 'white' : 'inherit',
                                    minWidth: isCollapsed ? 0 : 40,
                                    justifyContent: 'center',
                                    transition: 'min-width 0.3s ease'
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                primaryTypographyProps={{
                                    fontWeight: isActive ? 700 : 500,
                                    fontSize: '0.95rem'
                                }}
                                sx={{
                                    opacity: isCollapsed ? 0 : 1,
                                    width: isCollapsed ? 0 : 'auto',
                                    overflow: 'hidden',
                                    transition: 'opacity 0.2s ease, width 0.3s ease',
                                    whiteSpace: 'nowrap'
                                }}
                            />
                        </ListItemButton>
                    )

                    return (
                        <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                            {isCollapsed ? (
                                <Tooltip title={item.label} placement="right" arrow>
                                    {button}
                                </Tooltip>
                            ) : (
                                button
                            )}
                        </ListItem>
                    )
                })}
            </List>

            <Divider />

            {/* Footer Actions */}
            <Box sx={{ p: isCollapsed ? 1 : 2 }}>
                {isCollapsed ? (
                    <Tooltip title="Logout" placement="right" arrow>
                        <ListItemButton
                            onClick={handleLogout}
                            sx={{
                                borderRadius: 2,
                                color: 'error.main',
                                justifyContent: 'center',
                                minHeight: 48,
                                '&:hover': {
                                    bgcolor: 'error.50',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: 'error.main', minWidth: 0, justifyContent: 'center' }}>
                                <LogoutIcon />
                            </ListItemIcon>
                        </ListItemButton>
                    </Tooltip>
                ) : (
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 2,
                            color: 'error.main',
                            '&:hover': {
                                bgcolor: 'error.50',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: 'error.main', minWidth: 40, transition: 'min-width 0.3s ease' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary="Logout"
                            primaryTypographyProps={{
                                fontWeight: 600
                            }}
                            sx={{
                                opacity: isCollapsed ? 0 : 1,
                                width: isCollapsed ? 0 : 'auto',
                                overflow: 'hidden',
                                transition: 'opacity 0.2s ease, width 0.3s ease',
                                whiteSpace: 'nowrap'
                            }}
                        />
                    </ListItemButton>
                )}
            </Box>
        </Box>
    )

    return (
        <Box sx={{ display: 'flex' }}>
            <Drawer
                variant="permanent"
                onMouseEnter={() => setExpanded(true)}
                onMouseLeave={() => setExpanded(false)}
                sx={{
                    width: expanded ? drawerWidth : drawerWidthCollapsed,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: expanded ? drawerWidth : drawerWidthCollapsed,
                        borderRight: 'none',
                        boxShadow: '0 0 24px rgba(0,0,0,0.08)',
                        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        overflowX: 'hidden',
                    },
                }}
                open
            >
                {drawerContent(!expanded)}
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {children}
            </Box>
        </Box>
    )
}
