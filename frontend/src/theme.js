import { createTheme } from '@mui/material/styles'

const getPalette = (mode) => ({
  mode,
  primary: { main: '#3B82F6' },
  secondary: { main: '#22C55E' },
  background: mode === 'dark'
    ? { default: '#0B1020', paper: '#0F172A' }
    : { default: '#F7F8FA', paper: '#FFFFFF' },
  divider: mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
})

const components = {
  MuiCard: { styleOverrides: { root: { borderRadius: 14 } } },
  MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, borderRadius: 10 } } },
  MuiChip: { styleOverrides: { root: { borderRadius: 8 } } }
}

const typography = {
  fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, \"Apple Color Emoji\", \"Segoe UI Emoji\"',
  h3: { fontWeight: 800 },
  h5: { fontWeight: 700 },
}

export const getAppTheme = (mode = 'light') => createTheme({
  palette: getPalette(mode),
  shape: { borderRadius: 12 },
  components,
  typography
})
