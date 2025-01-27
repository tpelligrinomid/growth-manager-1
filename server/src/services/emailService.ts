import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendInvitationEmail = async (
  email: string,
  role: string,
  token: string
) => {
  const acceptUrl = `${process.env.FRONTEND_URL}/accept-invitation/${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@marketersindemand.com',
    to: email,
    subject: 'Invitation to Join Growth Manager',
    html: `
      <h1>Welcome to Growth Manager!</h1>
      <p>You have been invited to join Growth Manager as a ${role.replace('_', ' ')}.</p>
      <p>Click the link below to accept your invitation:</p>
      <a href="${acceptUrl}" style="
        display: inline-block;
        background-color: #5C29C5;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 4px;
        margin: 16px 0;
      ">Accept Invitation</a>
      <p>This invitation will expire in 7 days.</p>
      <p>If you did not expect this invitation, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
}; 