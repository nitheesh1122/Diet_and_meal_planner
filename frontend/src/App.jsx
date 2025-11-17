import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Box, AppBar, Toolbar, IconButton, useTheme, useMediaQuery } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import MenuIcon from '@mui/icons-material/Menu'
import Sidebar from './components/Sidebar'
import MacroBar from './components/MacroBar'
import Footer from './components/Footer'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Planner from './pages/Planner'
import GroceryList from './pages/GroceryList'
import Settings from './pages/Settings'
import Recipes from './pages/Recipes'
import { useAuth } from './context/AuthContext'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
}

function PageTransition({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()
  const { token } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [sidebarExpanded, setSidebarExpanded] = React.useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  // Don't show sidebar on login/signup pages
  const showSidebar = token && !['/login', '/signup'].includes(location.pathname)
  
  // Calculate sidebar width based on expanded state
  const sidebarWidth = sidebarExpanded ? 280 : 64

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {showSidebar && (
          <Sidebar 
            mobileOpen={mobileOpen} 
            onMobileClose={handleDrawerToggle}
            expanded={sidebarExpanded}
            onExpandedChange={setSidebarExpanded}
          />
        )}
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            width: { 
              md: showSidebar ? `calc(100% - ${sidebarWidth}px)` : '100%' 
            },
            minHeight: 0, // Important for flex children to allow scrolling
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          {showSidebar && (
            <AppBar
              position="fixed"
              sx={{
                width: { 
                  md: showSidebar ? `calc(100% - ${sidebarWidth}px)` : '100%' 
                },
                ml: { 
                  md: showSidebar ? `${sidebarWidth}px` : 0 
                },
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: theme.transitions.create(['width', 'margin'], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.enteringScreen,
                }),
              }}
            >
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, display: { md: 'none' } }}
                >
                  <MenuIcon />
                </IconButton>
              </Toolbar>
            </AppBar>
          )}
          
          {showSidebar && <MacroBar />}
          
          <Box 
            sx={{ 
              mt: showSidebar ? 8 : 0, 
              p: { xs: 2, sm: 3 }, 
              flexGrow: 1,
              minHeight: 0, // Important for flex children to allow scrolling
              overflowY: 'auto', // Enable vertical scrolling
              overflowX: 'hidden' // Prevent horizontal scrolling
            }}
          >
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
                <Route path="/" element={<PrivateRoute><PageTransition><Dashboard /></PageTransition></PrivateRoute>} />
                <Route path="/planner" element={<PrivateRoute><PageTransition><Planner /></PageTransition></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><PageTransition><Settings /></PageTransition></PrivateRoute>} />
                <Route path="/grocery" element={<PrivateRoute><PageTransition><GroceryList /></PageTransition></PrivateRoute>} />
                <Route path="/recipes" element={<PrivateRoute><PageTransition><Recipes /></PageTransition></PrivateRoute>} />
              </Routes>
            </AnimatePresence>
          </Box>
        </Box>
      </Box>
      
      {/* Footer - Only show on authenticated pages */}
      {showSidebar && <Footer />}
    </Box>
  )
}
