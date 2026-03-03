const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Verify environment variables
    const hasBrevoApiKey = !!process.env.BREVO_API_KEY;
    const hasSmtpCreds = !!process.env.EMAIL_USER && !!process.env.EMAIL_PASSWORD;
    if (!hasBrevoApiKey && !hasSmtpCreds) {
        console.error('❌ Email configuration missing:', {
            BREVO_API_KEY: process.env.BREVO_API_KEY ? '✓ Set' : '✗ Missing',
            EMAIL_USER: process.env.EMAIL_USER ? '✓ Set' : '✗ Missing',
            EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Missing'
        });
        throw new Error('Email service not configured. Missing BREVO_API_KEY or SMTP credentials');
    }

    // Handle attachments (for PDF reports)
    const attachments = options.attachments || [];

    console.log('📧 Initializing email service...');
    console.log('   Provider:', hasBrevoApiKey ? 'Brevo API' : 'Brevo SMTP');
    console.log('   From:', process.env.FROM_EMAIL || process.env.EMAIL_USER);

    // Build reset URL based on environment
    const actionUrl = options.url || `${process.env.FRONTEND_URL || 'http://127.0.0.1:5500'}`;
    const isPasswordReset = options.template === 'password-reset';
    const preheaderText = options.preheader || (isPasswordReset
        ? 'Reset your StudyFlow password in a few clicks.'
        : 'Your latest StudyFlow updates are ready.');
    const ctaLabel = options.ctaLabel || (isPasswordReset ? 'Reset Password' : 'Open StudyFlow');
    const safeMessage = (options.message || '').replace(/\n/g, '<br/>');
    const textBody = options.text || `${options.message || ''}\n\n${actionUrl ? `Link: ${actionUrl}\n\n` : ''}If you didn\'t request this, you can safely ignore this email.`;

    // Build message
    const message = {
        from: `${process.env.FROM_NAME || 'StudyFlow Support'} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: textBody,
        attachments: attachments, // Support PDF attachments
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0d0d18;font-family:'Segoe UI',Arial,sans-serif;">

<!-- Preheader -->
<div style="display:none;max-height:0;overflow:hidden;color:transparent;">${preheaderText}</div>

<!-- Outer wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(160deg,#0d0d18 0%,#12102a 50%,#0d0d18 100%);padding:32px 12px;">
<tr><td align="center">

  <!-- Card -->
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;border-radius:24px;overflow:hidden;background:#16152e;border:1px solid rgba(139,92,246,0.18);box-shadow:0 32px 80px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.03);">

    <!-- ═══ HEADER ═══ -->
    <tr>
      <td style="background:linear-gradient(135deg,#3b0764 0%,#4c0085 40%,#6d28d9 100%);padding:32px 28px;text-align:center;position:relative;">
        <!-- Glow orb -->
        <div style="position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:140px;height:140px;background:radial-gradient(circle,rgba(167,139,250,0.25) 0%,transparent 70%);border-radius:50%;"></div>
        <!-- Logo mark -->
        <table cellpadding="0" cellspacing="0" style="margin:0 auto 14px;">
          <tr><td style="background:rgba(255,255,255,0.12);border-radius:18px;padding:12px;border:1px solid rgba(255,255,255,0.18);backdrop-filter:blur(8px);">
            <svg width="36" height="36" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#e9d5ff"/>
                  <stop offset="100%" stop-color="#c4b5fd"/>
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="44" fill="none" stroke="url(#g1)" stroke-width="2.5" opacity="0.35"/>
              <path d="M50 22 Q72 38 62 63 Q52 76 38 63 Q28 38 50 22" fill="url(#g1)"/>
              <circle cx="50" cy="56" r="7" fill="#ffffff" opacity="0.9"/>
            </svg>
          </td></tr>
        </table>
        <h1 style="margin:0 0 4px;font-size:30px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">StudyFlow</h1>
        <p style="margin:0;font-size:13px;color:rgba(233,213,255,0.7);letter-spacing:1.5px;text-transform:uppercase;">${isPasswordReset ? 'Account Security' : 'Daily Progress'}</p>
      </td>
    </tr>

    <!-- ═══ HEADING ROW ═══ -->
    <tr>
      <td style="padding:28px 28px 0;">
        <h2 style="margin:0 0 6px;font-size:21px;font-weight:700;color:#e9d5ff;">${options.heading || options.subject || 'StudyFlow Update'}</h2>
        <p style="margin:0;font-size:13px;color:#7c6fa0;line-height:1.5;">${preheaderText}</p>
      </td>
    </tr>

    <!-- ═══ CONTENT CARD ═══ -->
    <tr>
      <td style="padding:16px 28px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(145deg,#1c1a38,#141228);border-radius:18px;overflow:hidden;border:1px solid rgba(139,92,246,0.14);">
          <tr>
            <td style="padding:24px;">
              <!-- Greeting -->
              <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#f1f0ff;">Hi there,</p>
              ${isPasswordReset
                ? `<p style="margin:0 0 20px;font-size:14px;color:#b8b0d8;line-height:1.7;">We received a request to reset your <strong style="color:#c4b5fd;">StudyFlow</strong> password. Click the button below — this link expires in <strong style="color:#f9a8d4;">10 minutes</strong>.</p>`
                : `<p style="margin:0 0 20px;font-size:14px;color:#b8b0d8;line-height:1.7;">${safeMessage || 'Here is your latest update from StudyFlow.'}</p>`
              }
              ${actionUrl ? `
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#7c3aed 0%,#a855f7 100%);border-radius:14px;box-shadow:0 8px 32px rgba(124,58,237,0.45);">
                    <a href="${actionUrl}" style="display:block;padding:14px 40px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:0.3px;white-space:nowrap;">${ctaLabel}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px;font-size:11.5px;color:#4b4668;text-align:center;">Button not working? Copy this link:</p>
              <p style="margin:0;font-size:10.5px;word-break:break-all;color:#7c6bbf;text-align:center;line-height:1.6;">${actionUrl}</p>
              ` : ''}
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-top:1px solid rgba(139,92,246,0.12);">
                <tr><td style="padding-top:14px;">
                  <p style="margin:0;font-size:11.5px;color:#4b4668;line-height:1.6;">If you didn't request this, you can safely ignore this email. Your account is secure.</p>
                </td></tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ═══ DIVIDER ═══ -->
    <tr>
      <td style="padding:22px 28px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="height:1px;background:linear-gradient(90deg,transparent,rgba(139,92,246,0.3),transparent);"></td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ═══ DEVELOPER CARD ═══ -->
    <tr>
      <td style="padding:20px 28px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(145deg,rgba(109,40,217,0.12),rgba(76,0,133,0.06));border-radius:18px;border:1px solid rgba(139,92,246,0.2);">
          <tr>
            <td style="padding:20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr valign="top">
                  <!-- Avatar -->
                  <td width="72" style="padding-right:16px;">
                    <img src="https://avatars.githubusercontent.com/salahuddingfx" alt="Salah Uddin Kader" width="64" height="64"
                      style="border-radius:16px;display:block;border:2px solid rgba(167,139,250,0.4);box-shadow:0 4px 16px rgba(109,40,217,0.3);" />
                  </td>
                  <!-- Info -->
                  <td>
                    <div style="font-size:15px;font-weight:700;color:#ede9fe;margin-bottom:2px;">Salah Uddin Kader</div>
                    <div style="font-size:11px;color:#a78bfa;margin-bottom:12px;letter-spacing:0.3px;">Full Stack Developer &nbsp;·&nbsp; UI/UX Designer</div>
                    <!-- Social links row -->
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding-right:8px;">
                          <a href="https://wa.me/8801851075537" style="display:inline-block;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.25);border-radius:8px;padding:5px 10px;color:#4ade80;text-decoration:none;font-size:11px;font-weight:600;">WhatsApp</a>
                        </td>
                        <td style="padding-right:8px;">
                          <a href="https://github.com/salahuddingfx" style="display:inline-block;background:rgba(148,163,184,0.1);border:1px solid rgba(148,163,184,0.2);border-radius:8px;padding:5px 10px;color:#cbd5e1;text-decoration:none;font-size:11px;font-weight:600;">GitHub</a>
                        </td>
                        <td>
                          <a href="https://facebook.com/salahuddingfx" style="display:inline-block;background:rgba(59,130,246,0.12);border:1px solid rgba(59,130,246,0.25);border-radius:8px;padding:5px 10px;color:#93c5fd;text-decoration:none;font-size:11px;font-weight:600;">Facebook</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ═══ TEAM CARD ═══ -->
    <tr>
      <td style="padding:14px 28px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(16,185,129,0.06);border-radius:16px;border:1px solid rgba(16,185,129,0.15);">
          <tr>
            <td style="padding:16px 20px;">
              <div style="font-size:12px;font-weight:700;color:#34d399;margin-bottom:12px;letter-spacing:0.5px;text-transform:uppercase;">StudyFlow Team</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr valign="top">
                  <!-- Member 1 -->
                  <td width="50%" style="padding-right:10px;">
                    <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:10px 12px;border:1px solid rgba(255,255,255,0.05);">
                      <div style="font-size:12px;font-weight:600;color:#a7f3d0;margin-bottom:2px;">Salah Uddin Kader</div>
                      <div style="font-size:10.5px;color:#6ee7b7;opacity:0.75;line-height:1.5;">Full-Stack Developer<br/>Architecture &amp; UI/UX</div>
                    </div>
                  </td>
                  <!-- Member 2 -->
                  <td width="50%">
                    <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:10px 12px;border:1px solid rgba(255,255,255,0.05);">
                      <div style="font-size:12px;font-weight:600;color:#a7f3d0;margin-bottom:2px;">Sohana Rahman</div>
                      <div style="font-size:10.5px;color:#6ee7b7;opacity:0.75;line-height:1.5;">Admin Panel Manager<br/>Analytics &amp; Reports</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- ═══ FOOTER ═══ -->
    <tr>
      <td style="padding:24px 28px 28px;text-align:center;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="border-top:1px solid rgba(139,92,246,0.12);padding-top:20px;">
              <p style="margin:0 0 8px;font-size:12px;color:#4b4668;">© ${new Date().getFullYear()} StudyFlow. All rights reserved.</p>
              <p style="margin:0 0 12px;font-size:11px;color:#3d3660;">Crafted with 💜 by Salah Uddin Kader</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="padding:0 6px;">
                    <a href="https://studyflow.salahuddin.codes" style="color:#7c6bbf;text-decoration:none;font-size:11px;">Home</a>
                  </td>
                  <td style="color:#3d3660;font-size:11px;">·</td>
                  <td style="padding:0 6px;">
                    <a href="https://studyflow.salahuddin.codes" style="color:#7c6bbf;text-decoration:none;font-size:11px;">Dashboard</a>
                  </td>
                  <td style="color:#3d3660;font-size:11px;">·</td>
                  <td style="padding:0 6px;">
                    <a href="https://github.com/salahuddingfx/Study-Flow" style="color:#7c6bbf;text-decoration:none;font-size:11px;">GitHub</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

  </table>
  <!-- /Card -->

</td></tr>
</table>
<!-- /Outer wrapper -->

</body>
</html>`
    };

    if (hasBrevoApiKey) {
        try {
            console.log('📤 Sending email via Brevo API to:', options.email);
            
            // Prepare Brevo API payload
            const brevoPayload = {
                sender: {
                    name: process.env.FROM_NAME || 'StudyFlow Support',
                    email: process.env.FROM_EMAIL || process.env.EMAIL_USER
                },
                to: [{ email: options.email }],
                subject: options.subject,
                textContent: options.message,
                htmlContent: message.html
            };

            // Add attachments if present (Brevo expects base64 encoded content)
            if (attachments && attachments.length > 0) {
                brevoPayload.attachment = attachments.map(att => ({
                    content: att.content ? att.content.toString('base64') : '',
                    name: att.filename || 'attachment'
                }));
                console.log(`   📎 Including ${attachments.length} attachment(s)`);
            }

            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'api-key': process.env.BREVO_API_KEY
                },
                body: JSON.stringify(brevoPayload)
            });

            const resultText = await response.text();
            if (!response.ok) {
                throw new Error(resultText || 'Brevo API request failed');
            }
            console.log('✓ Email sent successfully via Brevo API');
            return { provider: 'brevo-api', response: resultText };
        } catch (error) {
            console.error('❌ Brevo API sending failed:', error.message);
            throw new Error(`Failed to send email via Brevo API: ${error.message}`);
        }
    }

    // SMTP fallback
    console.log('   Host:', process.env.EMAIL_HOST || 'smtp-relay.brevo.com');
    console.log('   Port:', process.env.EMAIL_PORT || '587');

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        connectionTimeout: 10000,
        socketTimeout: 10000,
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔐 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✓ SMTP connection verified');
        console.log('📤 Sending email to:', options.email);
        const info = await transporter.sendMail(message);
        console.log('✓ Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ SMTP sending failed:', error.message);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

module.exports = sendEmail;