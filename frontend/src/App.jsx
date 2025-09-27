import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Container, Box } from '@mui/material'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import MacroBar from './components/MacroBar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Planner from './pages/Planner'
import Progress from './pages/Progress'
import GroceryList from './pages/GroceryList'
import Settings from './pages/Settings'
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
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <MacroBar />
      <Container maxWidth="lg" sx={{ mt: 3, mb: 6, flexGrow: 1 }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
            <Route path="/" element={<PrivateRoute><PageTransition><Dashboard /></PageTransition></PrivateRoute>} />
            <Route path="/planner" element={<PrivateRoute><PageTransition><Planner /></PageTransition></PrivateRoute>} />
            <Route path="/progress" element={<PrivateRoute><PageTransition><Progress /></PageTransition></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><PageTransition><Settings /></PageTransition></PrivateRoute>} />
            <Route path="/grocery" element={<PrivateRoute><PageTransition><GroceryList /></PageTransition></PrivateRoute>} />
          </Routes>
        </AnimatePresence>
      </Container>
    </Box>
  )
}
