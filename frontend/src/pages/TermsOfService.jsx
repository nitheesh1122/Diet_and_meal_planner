import React from 'react'
import { Box, Container, Typography, Paper, Stack, Divider, Link } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import Logo from '../components/Logo'

export default function TermsOfService() {
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
                Terms of Service
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
                  Agreement to Terms
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  By accessing or using Meal Planner ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, then you may not access the Service.
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  These Terms apply to all visitors, users, and others who access or use the Service. Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Use of the Service
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                  Eligibility
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  You must be at least 13 years old to use this Service. By using the Service, you represent and warrant that you are at least 13 years of age and have the legal capacity to enter into these Terms.
                </Typography>

                <Typography variant="body2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                  Account Registration
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  To access certain features of the Service, you must register for an account. You agree to:
                </Typography>
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  <li><Typography variant="body1" color="text.secondary">Provide accurate, current, and complete information</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Maintain and update your information to keep it accurate</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Maintain the security of your password and account</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Accept responsibility for all activities under your account</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Notify us immediately of any unauthorized use</Typography></li>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Acceptable Use
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  You agree not to use the Service:
                </Typography>
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  <li><Typography variant="body1" color="text.secondary">In any way that violates any applicable law or regulation</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">To transmit any malicious code, viruses, or harmful data</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">To attempt to gain unauthorized access to the Service or related systems</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">To interfere with or disrupt the Service or servers</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">To impersonate or misrepresent your affiliation with any person or entity</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">To collect or store personal data about other users</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">For any commercial purpose without our express written consent</Typography></li>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Content and Intellectual Property
                </Typography>
                <Typography variant="body2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                  Our Content
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  The Service and its original content, features, and functionality are owned by Meal Planner and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </Typography>

                <Typography variant="body2" fontWeight={600} sx={{ mt: 2, mb: 1 }}>
                  Your Content
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  You retain ownership of any content you submit, post, or display on or through the Service ("Your Content"). By submitting Your Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute Your Content solely for the purpose of providing and improving the Service.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Health and Medical Disclaimer
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  <strong>IMPORTANT:</strong> The Service provides meal planning and nutrition tracking tools for informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment.
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or dietary needs. Never disregard professional medical advice or delay in seeking it because of something you have read or used on this Service.
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  The nutritional information provided is based on general data and may not be accurate for your specific needs. Individual nutritional requirements vary, and you should consult with a healthcare professional before making significant changes to your diet.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Service Availability
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  We strive to provide a reliable service but do not guarantee that the Service will be available at all times. We reserve the right to:
                </Typography>
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  <li><Typography variant="body1" color="text.secondary">Modify or discontinue the Service at any time</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Perform maintenance that may temporarily interrupt service</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Suspend or terminate accounts that violate these Terms</Typography></li>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Limitation of Liability
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  To the maximum extent permitted by law, Meal Planner shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
                </Typography>
                <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                  <li><Typography variant="body1" color="text.secondary">Your use or inability to use the Service</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Any unauthorized access to or use of our servers or data</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Any errors or omissions in any content</Typography></li>
                  <li><Typography variant="body1" color="text.secondary">Any interruption or cessation of transmission to or from the Service</Typography></li>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Indemnification
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  You agree to defend, indemnify, and hold harmless Meal Planner and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorney's fees, arising out of or in any way connected with your use of the Service or violation of these Terms.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Termination
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service will cease immediately.
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  You may terminate your account at any time by contacting us or using the account deletion feature in your settings.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Changes to Terms
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Governing Law
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  These Terms shall be governed and construed in accordance with the laws, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Contact Information
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  If you have any questions about these Terms of Service, please contact us:
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

