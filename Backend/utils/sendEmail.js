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
            <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheaderText}</div>
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%);padding:24px 0;font-family:Arial,sans-serif;">
                <tr>
                    <td align="center">
                        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:620px;background:#111827;border-radius:20px;overflow:hidden;border:1px solid rgba(139,92,246,0.2);box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                            <tr>
                                <td style="background:linear-gradient(135deg,#6d28d9 0%,#764ba2 100%);padding:24px;text-align:center;">
                                    <svg width="40" height="40" viewBox="0 0 100 100" style="margin:0 auto 12px;display:block;">
                                        <defs>
                                            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stop-color="#ffffff" />
                                                <stop offset="100%" stop-color="#e2e8f0" />
                                            </linearGradient>
                                        </defs>
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGrad)" stroke-width="2" opacity="0.3"/>
                                        <path d="M50 25 Q70 40 60 65 Q50 75 40 65 Q30 40 50 25" fill="url(#logoGrad)"/>
                                        <circle cx="50" cy="55" r="6" fill="url(#logoGrad)"/>
                                    </svg>
                                    <h1 style="margin:0;font-size:28px;color:#ffffff;font-weight:bold;">StudyFlow</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:28px 28px 8px;color:#e5e7eb;">
                                    <h2 style="margin:0;font-size:22px;color:#c4b5fd;font-weight:bold;">${options.heading || options.subject || 'StudyFlow Update'}</h2>
                                    <p style="margin:10px 0 0;font-size:14px;color:#a3b8c7;">${preheaderText}</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:0 28px 24px;color:#e5e7eb;">
                                    <div style="background:#0b1220;border-radius:14px;padding:24px;border:1px solid rgba(148,163,184,0.15);">
                                        <p style="margin:0 0 10px;font-size:15px;font-weight:bold;">Hi there,</p>
                                        ${isPasswordReset
                                            ? `<p style="margin:0 0 16px;font-size:14px;color:#cbd5f5;">We received a request to reset your StudyFlow password. This link expires in <strong>10 minutes</strong>.</p>`
                                            : `<p style="margin:0 0 16px;font-size:14px;color:#cbd5f5;line-height:1.6;">${safeMessage || 'Here is your latest update from StudyFlow.'}</p>`
                                        }
                                        ${actionUrl ? `
                                        <div style="text-align:center;margin:24px 0;">
                                            <a href="${actionUrl}" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6 0%,#764ba2 100%);color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;box-shadow:0 8px 24px rgba(139,92,246,0.3);">${ctaLabel}</a>
                                        </div>
                                        <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">If the button doesn\'t work, copy this link:</p>
                                        <p style="margin:0;font-size:11px;word-break:break-all;color:#a78bfa;opacity:0.8;">${actionUrl}</p>
                                        ` : ''}
                                        <p style="margin:16px 0 0;font-size:12px;color:#64748b;">If you didn't request this, you can safely ignore this email.</p>
                                    </div>
                                    <div style="margin-top:20px;background:linear-gradient(135deg,rgba(139,92,246,0.1) 0%,rgba(118,75,162,0.05) 100%);border-radius:14px;padding:18px;border:1px solid rgba(139,92,246,0.25);">
                                        <div style="display:flex;gap:14px;align-items:flex-start;">
                                            <img src="https://avatars.githubusercontent.com/salahuddingfx" alt="Salah Uddin Kader" width="64" height="64" style="border-radius:14px;display:block;border:2px solid rgba(139,92,246,0.3);" />
                                            <div style="flex:1;">
                                                <div style="font-size:14px;font-weight:bold;color:#e2e8f0;margin-bottom:2px;">Salah Uddin Kader</div>
                                                <div style="font-size:12px;color:#a78bfa;margin-bottom:10px;">Full Stack Developer • UI/UX Designer</div>
                                                <div style="font-size:11px;color:#cbd5f5;line-height:1.8;">
                                                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.8">
                                                            <path d="M19.95 21H4.05C2.9 21 2 20.1 2 19V5c0-1.1.9-2 2.05-2h15.9C21.1 3 22 3.9 22 5v14c0 1.1-.9 2-2.05 2z" fill="#22c55e"/>
                                                            <path d="M16.5 12.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm4 0c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z" fill="#111827"/>
                                                        </svg>
                                                        <span>+8801851-75537</span>
                                                    </div>
                                                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.8">
                                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#22c55e"/>
                                                        </svg>
                                                        <a href="https://wa.me/8801851075537" style="color:#a78bfa;text-decoration:none;">WhatsApp</a>
                                                    </div>
                                                    <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.8">
                                                            <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-3 9c-.552 0-1-.448-1-1s.448-1 1-1 1 .448 1 1-.448 1-1 1zm3-7c-3.859 0-7 3.141-7 7h2c0-2.757 2.243-5 5-5s5 2.243 5 5c0 2.206-1.794 4-4 4v2c3.314 0 6-2.686 6-6 0-3.859-3.141-7-7-7zm4 9c-.552 0-1-.448-1-1s.448-1 1-1 1 .448 1 1-.448 1-1 1z" fill="#60a5fa"/>
                                                        </svg>
                                                        <a href="https://github.com/salahuddingfx" style="color:#a78bfa;text-decoration:none;">github.com/salahuddingfx</a>
                                                    </div>
                                                    <div style="display:flex;align-items:center;gap:6px;margin-top:8px;padding-top:8px;border-top:1px solid rgba(139,92,246,0.2);">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.8">
                                                            <circle cx="12" cy="12" r="10" fill="#3b82f6"/>
                                                        </svg>
                                                        <a href="https://facebook.com/salahuddingfx" style="color:#a78bfa;text-decoration:none;font-size:11px;">facebook.com/salahuddingfx</a>
                                                    </div>
                                                    <div style="display:flex;align-items:center;gap:6px;">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity="0.8">
                                                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 9-2.25 9-5.5z" fill="#0ea5e9"/>
                                                        </svg>
                                                        <a href="https://twitter.com/salahuddingfx" style="color:#a78bfa;text-decoration:none;font-size:11px;">twitter.com/salahuddingfx</a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div style="margin-top:16px;padding:16px;background:rgba(34,197,94,0.08);border-radius:12px;border:1px solid rgba(34,197,94,0.2);">
                                        <div style="font-size:13px;font-weight:bold;color:#10b981;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#10b981"/>
                                            </svg>
                                            StudyFlow Team
                                        </div>
                                        <div style="font-size:11px;color:#cbd5f5;line-height:1.8;">
                                            <div style="margin-bottom:6px;padding-left:4px;">
                                                <strong style="color:#a7f3d0;">Salah Uddin Kader</strong> - Full-Stack Developer<br/>
                                                <span style="opacity:0.8;">Architecture, Development, UI/UX Design</span>
                                            </div>
                                            <div style="margin-bottom:6px;padding-left:4px;">
                                                <strong style="color:#a7f3d0;">Sohana Rahman</strong> - Admin Panel Manager<br/>
                                                <span style="opacity:0.8;">Analytics, Reports, Data Coordination</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:20px 28px;background:linear-gradient(180deg,rgba(139,92,246,0.1) 0%,transparent 100%);border-top:1px solid rgba(139,92,246,0.15);color:#a3b8c7;font-size:11px;text-align:center;">
                                    <div style="margin-bottom:8px;">© ${new Date().getFullYear()} StudyFlow. All rights reserved.</div>
                                    <div style="margin-bottom:6px;color:#64748b;">Developed with 💜 by Salah Uddin Kader</div>
                                    <div>
                                        <a href="https://studyflow.salahuddin.codes" style="color:#a78bfa;text-decoration:none;margin:0 6px;">Home</a> •
                                        <a href="https://studyflow.salahuddin.codes" style="color:#a78bfa;text-decoration:none;margin:0 6px;">Dashboard</a> •
                                        <a href="https://github.com/salahuddingfx/StudyFlow" style="color:#a78bfa;text-decoration:none;margin:0 6px;">GitHub</a>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        `
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