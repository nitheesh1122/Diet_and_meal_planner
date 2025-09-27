import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { AuthProvider } from './context/AuthContext'
import './index.css'

const baseTheme = () => createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' }, // blue
    secondary: { main: '#0288d1' },
    background: { default: '#ffffff', paper: '#ffffff' }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { styleOverrides: { root: { border: '1px solid #eaecef' } } },
    MuiAppBar: { styleOverrides: { root: { backgroundColor: '#ffffff', color: '#0d47a1' } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } }
  }
})

function Root() {
  const theme = React.useMemo(() => baseTheme(), [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
