const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Verify environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('❌ Email configuration missing:', {
            EMAIL_USER: process.env.EMAIL_USER ? '✓ Set' : '✗ Missing',
            EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? '✓ Set' : '✗ Missing'
        });
        throw new Error('Email service not configured. Missing EMAIL_USER or EMAIL_PASSWORD');
    }

    console.log('📧 Initializing email transporter...');
    console.log('   Host:', process.env.EMAIL_HOST || 'smtp-relay.brevo.com');
    console.log('   Port:', process.env.EMAIL_PORT || '587');
    console.log('   From:', process.env.FROM_EMAIL || process.env.EMAIL_USER);

    // Reusable transporter object using the default SMTP transport
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

    // Verify connection
    try {
        console.log('🔐 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✓ SMTP connection verified');
    } catch (error) {
        console.error('❌ SMTP verification failed:', error.message);
        throw new Error(`Email service verification failed: ${error.message}`);
    }

    // Build reset URL based on environment
    const resetUrl = options.url || `${process.env.FRONTEND_URL || 'http://127.0.0.1:5500'}`;

    // Send email with defined transport object
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

    try {
        console.log('📤 Sending email to:', options.email);
        const info = await transporter.sendMail(message);
        console.log('✓ Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

module.exports = sendEmail;