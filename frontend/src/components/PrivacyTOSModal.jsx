import React from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
  Checkbox, FormControlLabel, Stack, Paper, Divider
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function PrivacyTOSModal({ open, onAccept, onDecline }) {
  const [acceptedPrivacy, setAcceptedPrivacy] = React.useState(false)
  const [acceptedTOS, setAcceptedTOS] = React.useState(false)

  const handleAccept = () => {
    if (acceptedPrivacy && acceptedTOS) {
      onAccept()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => {}} // Prevent closing by clicking outside
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          position: 'relative'
        }
      }}
    >
      {/* Blurred background overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          bgcolor: 'rgba(0, 0, 0, 0.3)',
          zIndex: -1
        }}
      />

      <DialogTitle sx={{ bgcolor: 'background.paper', position: 'relative', zIndex: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          Terms & Privacy Agreement
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Please read and accept our Terms of Service and Privacy Policy to continue
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: 'background.paper', position: 'relative', zIndex: 1, maxHeight: '60vh', overflow: 'auto' }}>
        <Stack spacing={3}>
          <Paper elevation={2} sx={{ p: 3, bgcolor: 'action.hover' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Privacy Policy
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information.
            </Typography>
            <Button
              component={RouterLink}
              to="/privacy"
              target="_blank"
              variant="outlined"
              size="small"
            >
              View Full Privacy Policy
            </Button>
          </Paper>

          <Paper elevation={2} sx={{ p: 3, bgcolor: 'action.hover' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Terms of Service
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              By using our service, you agree to our Terms of Service. Please review them carefully.
            </Typography>
            <Button
              component={RouterLink}
              to="/terms"
              target="_blank"
              variant="outlined"
              size="small"
            >
              View Full Terms of Service
            </Button>
          </Paper>

          <Divider />

          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I understand and agree to the <strong>Privacy Policy</strong>. I consent to the collection, use, and processing of my personal data as described in the Privacy Policy.
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptedTOS}
                  onChange={(e) => setAcceptedTOS(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I understand and agree to the <strong>Terms of Service</strong>. I agree to use the service in accordance with the terms and conditions outlined.
                </Typography>
              }
            />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ bgcolor: 'background.paper', position: 'relative', zIndex: 1, p: 2 }}>
        <Button onClick={onDecline} color="error">
          Decline
        </Button>
        <Button
          onClick={handleAccept}
          variant="contained"
          disabled={!acceptedPrivacy || !acceptedTOS}
          sx={{ minWidth: 120 }}
        >
          Accept & Continue
        </Button>
      </DialogActions>
    </Dialog>
  )
}

