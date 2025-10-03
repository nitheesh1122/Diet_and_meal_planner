import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Button, Box, Drawer, List, ListItemButton, ListItemText, Divider } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'
import NotificationDrawer from './NotificationDrawer'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const { token, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <AppBar position="sticky" color="default" elevation={2}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => setMobileOpen(true)} sx={{ display: { sm: 'none' }, mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.3 }}>
            Diet & Meal Planner
          </Typography>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1.5, alignItems: 'center' }}>
            {token && (
              <>
                <Button color={location.pathname==='/'?'secondary':'inherit'} component={RouterLink} to="/">Dashboard</Button>
                <Button color={location.pathname==='/planner'?'secondary':'inherit'} component={RouterLink} to="/planner">Planner</Button>
                <Button color={location.pathname==='/progress'?'secondary':'inherit'} component={RouterLink} to="/progress">Progress</Button>
                <Button color={location.pathname==='/recipes'?'secondary':'inherit'} component={RouterLink} to="/recipes">Recipes</Button>
                <Button color={location.pathname==='/grocery'?'secondary':'inherit'} component={RouterLink} to="/grocery">Grocery</Button>
                <Button color={location.pathname==='/settings'?'secondary':'inherit'} component={RouterLink} to="/settings">Settings</Button>
                <NotificationBell />
              </>
            )}
            {token ? (
              <Button variant="contained" color="primary" onClick={handleLogout} sx={{ ml: 1 }}>Logout</Button>
            ) : (
              <Button variant="outlined" color="inherit" component={RouterLink} to="/login" sx={{ ml: 1 }}>Login</Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Box sx={{ width: 260 }} role="presentation" onClick={() => setMobileOpen(false)}>
          <Typography variant="h6" sx={{ p: 2, fontWeight: 700 }}>Menu</Typography>
          <Divider />
          {token ? (
            <List>
              <ListItemButton component={RouterLink} to="/"><ListItemText primary="Dashboard" /></ListItemButton>
              <ListItemButton component={RouterLink} to="/planner"><ListItemText primary="Planner" /></ListItemButton>
              <ListItemButton component={RouterLink} to="/progress"><ListItemText primary="Progress" /></ListItemButton>
              <ListItemButton component={RouterLink} to="/recipes"><ListItemText primary="Recipes" /></ListItemButton>
              <ListItemButton component={RouterLink} to="/grocery"><ListItemText primary="Grocery" /></ListItemButton>
              <ListItemButton component={RouterLink} to="/settings"><ListItemText primary="Settings" /></ListItemButton>
              <Divider sx={{ my: 1 }} />
              <ListItemButton onClick={handleLogout}><ListItemText primary="Logout" /></ListItemButton>
            </List>
          ) : (
            <List>
              <ListItemButton component={RouterLink} to="/login"><ListItemText primary="Login" /></ListItemButton>
              <ListItemButton component={RouterLink} to="/signup"><ListItemText primary="Sign up" /></ListItemButton>
            </List>
          )}
        </Box>
      </Drawer>
      <NotificationDrawer />
    </>
  )
}
