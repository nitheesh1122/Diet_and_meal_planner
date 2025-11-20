import React from 'react'
import { Box, Container, Typography, Paper, Stack, Divider, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import Logo from '../components/Logo'

export default function PrivacyPolicy() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 6 }}>
      <Container maxWidth="md">
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
                Privacy Policy
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95 }}>
                Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Stack>
          </Paper>

          {/* Content */}
          <Paper elevation={3} sx={{ p: 4 }}>
            <Stack spacing={4}>
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Introduction
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Welcome to Meal Planner ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our meal planning application.
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  By using Meal Planner, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Information We Collect
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                  Personal Information
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  When you create an account, we collect information such as:
                </Typography>
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  <li><Typography variant="body1" color="text.secondary">Name and email address</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Age, gender, height, and weight</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Health goals and dietary preferences</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Activity level and fitness information</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Phone number (optional)</Typography></li>
                </Box>

                <Typography variant="body2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                  Usage Data
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  We automatically collect information about how you interact with our service, including:
                </Typography>
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  <li><Typography variant="body1" color="text.secondary">Meal plans you create and meals you log</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Nutritional data and progress tracking</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Device information and IP address</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Browser type and usage patterns</Typography></li>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  How We Use Your Information
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  We use the collected information for various purposes:
                </Typography>
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  <li><Typography variant="body1" color="text.secondary">To provide and maintain our service</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">To create personalized meal plans based on your goals and preferences</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">To track your nutrition and progress</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">To notify you about changes to our service</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">To provide customer support and respond to your inquiries</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">To detect, prevent, and address technical issues</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">To improve our service and develop new features</Typography></li>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Data Security
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
                </Typography>
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  <li><Typography variant="body1" color="text.secondary">Encryption of sensitive data in transit and at rest</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Secure authentication and password hashing</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Regular security audits and updates</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Access controls and authentication mechanisms</Typography></li>
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                  However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Data Sharing and Disclosure
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </Typography>
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  <li><Typography variant="body1" color="text.secondary">With your explicit consent</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">To comply with legal obligations or respond to lawful requests</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">To protect our rights, privacy, safety, or property</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">With service providers who assist us in operating our platform (under strict confidentiality agreements)</Typography></li>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Your Rights
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  You have the right to:
                </Typography>
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  <li><Typography variant="body1" color="text.secondary">Access and review your personal information</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Update or correct inaccurate information</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Request deletion of your account and data</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Opt-out of certain data collection practices</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Export your data in a portable format</Typography></li>
                </Box>
                <Typography variant="body1" color="text.secondary" paragraph>
                  To exercise these rights, please contact us at <Link href="mailto:support.mealplanner@gmail.com" color="primary">support.mealplanner@gmail.com</Link>.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Cookies and Tracking Technologies
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  We use cookies and similar tracking technologies to track activity on our service and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Children's Privacy
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Changes to This Privacy Policy
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Contact Us
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  If you have any questions about this Privacy Policy, please contact us:
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Email: <Link href="mailto:support.mealplanner@gmail.com" color="primary">support.mealplanner@gmail.com</Link>
                </Typography>
              </Box>

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Link component={RouterLink} to="/" color="primary" underline="hover">
                  ← Back to Home
                </Link>
              </Box>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  )
}

