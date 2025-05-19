const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) Criar transporter (usando SendGrid para produção)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2) Definir opções do email
    const mailOptions = {
        from: `CryptoVision <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
        // html: options.html (para templates HTML)
    };

    // 3) Enviar email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;