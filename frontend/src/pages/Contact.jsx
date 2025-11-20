import React from 'react'
import { Box, Container, Typography, Paper, Stack, Divider, Link, TextField, Button, Grid, Card, CardContent } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import Logo from '../components/Logo'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import SendIcon from '@mui/icons-material/Send'

export default function Contact() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = React.useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real application, this would send the form data to a backend
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Paper elevation={2} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Stack spacing={2} alignItems="center" textAlign="center">
              <Logo variant="full" size="medium" />
              <Typography variant="h4" fontWeight={800}>
                Contact Us
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95, maxWidth: '600px' }}>
                Have questions or feedback? We'd love to hear from you! Get in touch with our team.
              </Typography>
            </Stack>
          </Paper>

          <Grid container spacing={4}>
            {/* Contact Information */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <Card elevation={3}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <EmailIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                      <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          Email Us
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Send us an email and we'll get back to you as soon as possible.
                        </Typography>
                        <Link href="mailto:support.mealplanner@gmail.com" color="primary" underline="hover" sx={{ fontWeight: 600 }}>
                          support.mealplanner@gmail.com
                        </Link>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card elevation={3}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <PhoneIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                      <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          Response Time
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          We typically respond within 24-48 hours during business days.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Monday - Friday: 9:00 AM - 6:00 PM
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                <Card elevation={3}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <LocationOnIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                      <Box>
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                          Office
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Meal Planner Headquarters
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Remote Team
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            {/* Contact Form */}
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                  Send us a Message
                </Typography>
                
                {submitted ? (
                  <Box sx={{ p: 3, bgcolor: 'success.50', borderRadius: 2, border: 1, borderColor: 'success.main' }}>
                    <Typography variant="h6" color="success.main" gutterBottom>
                      Thank you for your message!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      We've received your message and will get back to you soon. For immediate assistance, please email us directly at{' '}
                      <Link href="mailto:support.mealplanner@gmail.com" color="primary">support.mealplanner@gmail.com</Link>.
                    </Typography>
                  </Box>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Your Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Your Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                      
                      <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        variant="outlined"
                      />
                      
                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        multiline
                        rows={6}
                        variant="outlined"
                      />
                      
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={<SendIcon />}
                        sx={{
                          py: 1.5,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5568d3 0%, #6a3d8f 100%)',
                          }
                        }}
                      >
                        Send Message
                      </Button>
                    </Stack>
                  </form>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Additional Information */}
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Frequently Asked Questions
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  How do I reset my password?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  If you've forgotten your password, please use the "Forgot Password" link on the login page, or contact us at{' '}
                  <Link href="mailto:support.mealplanner@gmail.com" color="primary">support.mealplanner@gmail.com</Link>.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Can I export my meal plans?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Yes! You can export your meal plans and grocery lists from the respective pages in your dashboard.
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  How accurate is the nutritional information?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Our nutritional database is regularly updated, but individual needs may vary. Always consult with a healthcare professional for personalized dietary advice.
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Link component={RouterLink} to="/" color="primary" underline="hover">
              ← Back to Home
            </Link>
          </Box>
        </motion.div>
      </Container>
    </Box>
  )
}

