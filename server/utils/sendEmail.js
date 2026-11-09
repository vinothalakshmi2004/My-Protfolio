const nodemailer = require('nodemailer');
const { escapeHtml } = require('./sanitizers');

/**
 * Creates a nodemailer transport from env vars (returns null when e-mail isn't configured).
 * EMAIL_SERVICE (e.g. "gmail") or EMAIL_HOST/EMAIL_PORT/EMAIL_SECURE + EMAIL_USER/EMAIL_PASS.
 */
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  const auth = { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS };
  if (process.env.EMAIL_SERVICE) {
    return nodemailer.createTransport({ service: process.env.EMAIL_SERVICE, auth });
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth,
  });
};

/**
 * Sends the owner an e-mail when someone submits the contact form.
 * Never throws — the message is already saved in the database.
 * All user-supplied values are HTML-escaped before going into the template.
 */
const sendContactNotification = async ({ name, email, subject, message }) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log(`[Email] Skipped (EMAIL_USER/EMAIL_PASS not set). Message from ${name} saved in the database.`);
      return { sent: false, reason: 'Credentials not configured' };
    }

    const recipient = process.env.NOTIFICATION_RECEIVER_EMAIL || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const safe = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      subject: escapeHtml(subject),
      message: escapeHtml(message),
    };
    const received = new Date().toLocaleString();

    const info = await transporter.sendMail({
      from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
      to: recipient,
      replyTo: email,
      subject: `New portfolio message: ${subject.slice(0, 120)} (from ${name.slice(0, 60)})`,
      text: `New message from your portfolio website\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nDate: ${received}\n\n${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
          <h2 style="color: #7c3aed; margin-top: 0;">New Portfolio Message</h2>
          <p><strong>Name:</strong> ${safe.name}</p>
          <p><strong>Email:</strong> ${safe.email}</p>
          <p><strong>Subject:</strong> ${safe.subject}</p>
          <p><strong>Received:</strong> ${escapeHtml(received)}</p>
          <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-left: 4px solid #7c3aed; border-radius: 4px;">
            <p style="margin: 0; white-space: pre-line;">${safe.message}</p>
          </div>
          <small style="color: #64748b;">Reply directly to this e-mail to answer the sender.</small>
        </div>`,
    });
    console.log(`[Email] Notification sent: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email] Failed to send: ${error.message}`);
    return { sent: false, error: error.message };
  }
};

module.exports = { sendContactNotification };
