const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return null;
    }

    transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    return transporter;
}

async function sendAdminEmail(subject, html) {
    const mailer = getTransporter();

    if (!mailer || !process.env.ADMIN_EMAIL) {
        console.log("Email not sent: email settings are not configured.");
        return;
    }

    try {
        await mailer.sendMail({
            from: `"SHOP.CO Website" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject,
            html,
        });
        console.log(`Admin email sent: ${subject}`);
    } catch (error) {
        console.error("Email sending failed:", error.message);
    }
}

module.exports = {
    sendAdminEmail,
};
