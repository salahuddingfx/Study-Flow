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

    console.log('📧 Initializing email service...');
    console.log('   Provider:', hasBrevoApiKey ? 'Brevo API' : 'Brevo SMTP');
    console.log('   From:', process.env.FROM_EMAIL || process.env.EMAIL_USER);

    // Build reset URL based on environment
    const resetUrl = options.url || `${process.env.FRONTEND_URL || 'http://127.0.0.1:5500'}`;

    // Build message
    const message = {
        from: `${process.env.FROM_NAME || 'StudyFlow Support'} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 10px;">
                <h2 style="color: #6d28d9; text-align: center;">StudyFlow Password Reset</h2>
                <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                    <p>Hello,</p>
                    <p>You requested a password reset for your StudyFlow account.</p>
                    <p>Please click the button below to reset your password. This link will expire in 10 minutes.</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="${options.url}" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    </div>
                    <p style="font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
                </div>
                <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
                    &copy; ${new Date().getFullYear()} StudyFlow. All rights reserved.
                </div>
            </div>
        `
    };

    if (hasBrevoApiKey) {
        try {
            console.log('📤 Sending email via Brevo API to:', options.email);
            const response = await fetch('https://api.brevo.com/v3/smtp/email', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'api-key': process.env.BREVO_API_KEY
                },
                body: JSON.stringify({
                    sender: {
                        name: process.env.FROM_NAME || 'StudyFlow Support',
                        email: process.env.FROM_EMAIL || process.env.EMAIL_USER
                    },
                    to: [{ email: options.email }],
                    subject: options.subject,
                    textContent: options.message,
                    htmlContent: message.html
                })
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