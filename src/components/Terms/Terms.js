// ./src/components/Terms/Terms.js

import React from 'react';
import { Link } from 'react-router-dom';
import './Terms.css'; // Custom styles
import {
  Container,
  Typography,
  Divider,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Grid,
} from '@mui/material'; // Material-UI components
import GavelIcon from '@mui/icons-material/Gavel'; // Material-UI icon

function Terms() {
  const tocItems = [
    'Eligibility',
    'Account and Security',
    'User Content and Conduct',
    'Disclaimer of Warranties',
    'Limitation of Liability',
    'Indemnification',
    'Termination',
    'Governing Law',
    'Intellectual Property Rights',
    'DMCA Compliance',
    'Privacy Policy',
    'Data Protection and Privacy',
    'Changes to Terms and Conditions',
    'Severability',
    'Contact Information',
  ];

  return (
    <Container maxWidth="md" className="terms-container" sx={{ my: 5 }}>
      {/* Title */}
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        className="terms-title"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <GavelIcon sx={{ mr: 1, fontSize: '2.5rem', color: 'primary.main' }} />
        Terms and Conditions
      </Typography>

      {/* Table of Contents */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h6" gutterBottom>
          Table of Contents
        </Typography>
        <List component="nav">
          <Grid container spacing={1}>
            {tocItems.map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <ListItemButton
                  component="a"
                  href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                >
                  <ListItemText primary={`${index + 1}. ${item}`} />
                </ListItemButton>
              </Grid>
            ))}
          </Grid>
        </List>
      </Box>

      <Divider sx={{ mb: 5 }} />

      {/* Terms Sections */}
      <Box component="div" className="terms-content">
        {/* Section 1 */}
        <Box component="section" id="eligibility" sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom className="section-title">
            1. Eligibility
          </Typography>
          <Typography variant="body1" paragraph>
            Users must be at least 18 years of age or have parental consent to use this website. By using the website, you confirm that the information provided during signup is accurate and truthful.
          </Typography>
        </Box>

        {/* Section 2 */}
        <Box component="section" id="account-security" sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom className="section-title">
            2. Account and Security
          </Typography>
          <Typography variant="body1" paragraph>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Eternal Quill will not be liable for any loss or damage arising from your failure to comply with this security obligation. In the event of any unauthorized use of your account, you agree to notify us immediately.
          </Typography>
        </Box>

        {/* Section 3 */}
        <Box component="section" id="user-content" sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom className="section-title">
            3. User Content and Conduct
          </Typography>
          <Typography variant="body1" paragraph>
            By posting content on Eternal Quill, you grant the website a non-exclusive, royalty-free, perpetual, and worldwide license to use, modify, publish, and display your content. You retain full ownership of your content, but Eternal Quill may use it for promotional purposes on the platform. Users must not post content that is illegal, offensive, defamatory, or infringes on the intellectual property rights of others. Eternal Quill reserves the right to remove any content that violates these terms or is deemed inappropriate.
          </Typography>
        </Box>

        {/* Section 4 */}
        <Box component="section" id="disclaimer" sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom className="section-title">
            4. Disclaimer of Warranties
          </Typography>
          <Typography variant="body1" paragraph>
            Eternal Quill is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied. The owner does not warrant that the website will be uninterrupted, error-free, or free from viruses or other harmful components. All content provided on the website is for informational purposes only and should not be relied upon as professional advice.
          </Typography>
        </Box>

        {/* Section 5 */}
        <Box component="section" id="limitation" sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom className="section-title">
            5. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            In no event shall the owner, directors, officers, employees, or agents of Eternal Quill be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </Typography>
          <List component="ul" sx={{ listStyleType: 'disc', pl: 4 }}>
            <ListItemText primary="Access to or use of or inability to access or use the website;" />
            <ListItemText primary="Any conduct or content of any third party on the website;" />
            <ListItemText primary="Any content obtained from the website;" />
            <ListItemText primary="Unauthorized access, use, or alteration of your transmissions or content." />
          </List>
          <Typography variant="body1" paragraph>
            The limitations and exclusions of liability set out in this Section and elsewhere in the Terms shall apply even if Eternal Quill has been advised of the possibility of such damages.
          </Typography>
        </Box>

        {/* Section 6 */}
        <Box component="section" id="indemnification" sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom className="section-title">
            6. Indemnification
          </Typography>
          <Typography variant="body1" paragraph>
            You agree to indemnify and hold harmless Eternal Quill and its owner from any claims, losses, damages, liabilities, including legal fees, arising out of your use of the website, violation of these terms, or infringement of any intellectual property or other rights of any person or entity.
          </Typography>
        </Box>

        {/* Section 7 */}
        <Box component="section" id="termination" sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom className="section-title">
            7. Termination
          </Typography>
          <Typography variant="body1" paragraph>
            Eternal Quill reserves the right to terminate or suspend your account at any time, without notice, for any reason, including but not limited to a breach of these terms. Upon termination, your right to use the website will immediately cease.
          </Typography>
        </Box>

        {/* Section 8 */}
        <Box component="section" id="governing-law" sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom className="section-title">
            8. Governing Law
          </Typography>
          <Typography variant="body1" paragraph>
            These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions. You agree to submit to the personal jurisdiction of the courts located within India for the resolution of any disputes.
          </Typography>
        </Box>

        {/* Section 9 */}
        <Box component="section" id="intellectual-property" sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom className="section-title">
            9. Intellectual Property Rights
          </Typography>
          <Typography variant="body1" paragraph>
            All content, trademarks, service marks, and logos displayed on the website are the property of Eternal Quill or their respective owners. Users retain ownership of their content but grant Eternal Quill a license to use, distribute, and display their content as outlined in section 3.
          </Typography>
        </Box>

        {/* Section 10 */}
        <Box component="section" id="dmca" sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom className="section-title">
            10. DMCA Compliance
          </Typography>
          <Typography variant="body1" paragraph>
            Eternal Quill respects the intellectual property rights of others. If you believe that your work has been copied in a way that constitutes copyright infringement, please provide our Copyright
            Agent with the following:
          </Typography>
          <List component="ul" sx={{ listStyleType: 'disc', pl: 4 }}>
            <ListItemText primary="A physical or electronic signature of the person authorized to act on behalf of the owner;" />
            <ListItemText primary="A description of the copyrighted work that has been infringed;" />
            <ListItemText primary="A description of where the material that you claim is infringing is located on the site;" />
            <ListItemText primary="Your address, telephone number, and email address;" />
            <ListItemText primary="A statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law;" />
            <ListItemText primary="A statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner's behalf." />
          </List>
          <Typography variant="body1" paragraph>
            Our Copyright Agent for notice of claims of copyright infringement can be reached at:
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Eternal Quill</strong>
            <br />
            Email:{' '}
            <a href="mailto:theeternalquill@gmail.com" className="email-link">
              theeternalquill@gmail.com
            </a>
            <br />
          </Typography>
        </Box>

        {/* Section 11 */}
        <Box component="section" id="privacy" sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom className="section-title">
            11. Privacy Policy
          </Typography>
          <Typography variant="body1" paragraph>
            Your privacy is important to us. Please review our{' '}
            <Link to="/privacy-policy" className="internal-link">
              Privacy Policy
            </Link>{' '}
            to understand how we collect, use, and protect your personal information.
          </Typography>
        </Box>

        {/* Section 12 */}
        <Box component="section" id="data-protection" sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom className="section-title">
            12. Data Protection and Privacy
          </Typography>
          <Typography variant="body1" paragraph>
            Eternal Quill is committed to protecting your privacy. Our practices are governed by our{' '}
            <Link to="/privacy-policy" className="internal-link">
              Privacy Policy
            </Link>
            , which explains how we collect, use, and safeguard your personal information. By using
            the website, you consent to the collection and use of information in accordance with our
            Privacy Policy.
          </Typography>
        </Box>

        {/* Section 13 */}
        <Box component="section" id="changes" sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom className="section-title">
            13. Changes to Terms and Conditions
          </Typography>
          <Typography variant="body1" paragraph>
            Eternal Quill reserves the right to modify or replace these Terms and Conditions at any
            time. Any changes will be effective immediately upon posting on the website. Your
            continued use of the website following the posting of any changes constitutes acceptance
            of those changes. It is your responsibility to review these Terms and Conditions
            periodically for any updates.
          </Typography>
        </Box>

        {/* Section 14 */}
        <Box component="section" id="severability" sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom className="section-title">
            14. Severability
          </Typography>
          <Typography variant="body1" paragraph>
            If any provision of these Terms is found to be invalid or unenforceable by a court of
            competent jurisdiction, the remaining provisions of these Terms will remain in full
            effect and an enforceable term will be substituted reflecting our intent as closely as
            possible.
          </Typography>
        </Box>

        {/* Section 15 */}
        <Box component="section" id="contact" sx={{ mb: 5 }}>
          <Typography variant="h5" gutterBottom className="section-title">
            15. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms and Conditions, please contact us at:
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Eternal Quill</strong>
            <br />
            Email:{' '}
            <a href="mailto:theeternalquill@gmail.com" className="email-link">
              theeternalquill@gmail.com
            </a>
            <br />
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export default Terms;
