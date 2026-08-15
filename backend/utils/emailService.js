const nodemailer = require("nodemailer");

const transporter = process.env.NODE_ENV === "test" 
  ? nodemailer.createTransport({ streamTransport: true, newline: 'windows' })
  : nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true, // true for 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const baseTemplate = (content) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #4f46e5; color: #ffffff; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">SkillMap</h1>
    </div>
    <div style="padding: 20px; color: #333333; line-height: 1.6;">
      ${content}
    </div>
    <div style="background-color: #f9fafb; color: #6b7280; padding: 15px; text-align: center; font-size: 12px;">
      &copy; ${new Date().getFullYear()} SkillMap Platform. All rights reserved.
    </div>
  </div>
`;

exports.sendMail = async (mailOptions) => {
  return transporter.sendMail(mailOptions);
};

exports.sendAccessRequestEmail = async (ownerEmail, requester, jobRoleName, message) => {
  const content = `
    <h2>New Access Request</h2>
    <p>Admin <strong>${requester.name}</strong> (${requester.email}) has requested temporary modification access to your Job Role: <strong>${jobRoleName}</strong>.</p>
    <p><strong>Message:</strong><br/> <em>"${message || 'No message provided.'}"</em></p>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    <br/>
    <p style="text-align: center;">
      <a href="${FRONTEND_URL}/admin/access-requests" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Review Request</a>
    </p>
    <p style="font-size: 14px; color: #555;">Or navigate to "Access Requests" in your Admin Dashboard.</p>
  `;

  const mailOptions = {
    from: `"SkillMap Alerts" <${process.env.EMAIL_USER}>`,
    to: ownerEmail,
    subject: `SkillMap - Access Request for ${jobRoleName}`,
    html: baseTemplate(content),
    text: `New Access Request from ${requester.name} (${requester.email}) for ${jobRoleName}.\nMessage: ${message}\nReview at ${FRONTEND_URL}/admin/access-requests`
  };
  return transporter.sendMail(mailOptions);
};

exports.sendAccessApprovedEmail = async (requesterEmail, owner, jobRoleName, expiresAt, durationText) => {
  const content = `
    <h2>Access Request Approved</h2>
    <p>Your request to modify the Job Role <strong>${jobRoleName}</strong> has been approved by <strong>${owner.name}</strong>.</p>
    <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Approved</span></p>
    <p><strong>Access Granted:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Access Expires:</strong> ${new Date(expiresAt).toLocaleString()}</p>
    <p><strong>Duration:</strong> ${durationText}</p>
    <br/>
    <p style="text-align: center;">
      <a href="${FRONTEND_URL}/admin/job-roles" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Job Roles</a>
    </p>
  `;

  const mailOptions = {
    from: `"SkillMap Alerts" <${process.env.EMAIL_USER}>`,
    to: requesterEmail,
    subject: `SkillMap - Request Approved for ${jobRoleName}`,
    html: baseTemplate(content),
    text: `Your request to modify ${jobRoleName} was approved by ${owner.name}. Access expires at ${new Date(expiresAt).toLocaleString()}.`
  };
  return transporter.sendMail(mailOptions);
};

exports.sendAccessDeclinedEmail = async (requesterEmail, owner, jobRoleName) => {
  const content = `
    <h2>Access Request Declined</h2>
    <p>Your request to modify the Job Role <strong>${jobRoleName}</strong> was declined by <strong>${owner.name}</strong>.</p>
    <p><strong>Status:</strong> <span style="color: #ef4444; font-weight: bold;">Declined</span></p>
    <br/>
    <p>If you believe this is a mistake, please reach out to ${owner.name} directly.</p>
  `;

  const mailOptions = {
    from: `"SkillMap Alerts" <${process.env.EMAIL_USER}>`,
    to: requesterEmail,
    subject: `SkillMap - Request Declined for ${jobRoleName}`,
    html: baseTemplate(content),
    text: `Your request to modify ${jobRoleName} was declined by ${owner.name}.`
  };
  return transporter.sendMail(mailOptions);
};

exports.sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;
  const content = `
    <h2>Password Reset Request</h2>
    <p>Hello ${userName || "User"},</p>
    <p>You requested a password reset for your SkillMap account. Click the button below to reset your password:</p>
    <br/>
    <p style="text-align: center;">
      <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
    </p>
    <br/>
    <p>This link will expire in 15 minutes.</p>
    <p style="font-size: 14px; color: #555;">If you did not request this, please ignore this email.</p>
  `;

  const mailOptions = {
    from: `"SkillMap Support" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "SkillMap - Password Reset Request",
    html: baseTemplate(content),
    text: `Hello ${userName || "User"},\n\nReset your password here: ${resetLink}\n\nThis link expires in 15 minutes.`
  };
  return transporter.sendMail(mailOptions);
};

exports.sendPasswordConfirmEmail = async (userEmail, userName) => {
  const content = `
    <h2>Password Changed Successfully</h2>
    <p>Hello ${userName || "User"},</p>
    <p>This is a confirmation that the password for your SkillMap account has been successfully changed.</p>
    <br/>
    <p style="font-size: 14px; color: #555;">If you did not perform this action, please contact support immediately.</p>
  `;

  const mailOptions = {
    from: `"SkillMap Support" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "SkillMap - Password Changed",
    html: baseTemplate(content),
    text: `Hello ${userName || "User"},\n\nYour password has been successfully changed.`
  };
  return transporter.sendMail(mailOptions);
};

