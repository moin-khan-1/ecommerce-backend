
const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    if (
        !process.env.EMAIL_USER ||
        !process.env.EMAIL_PASS
    ) {
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

// Reusable email function for customers and admin
async function sendEmail(to, subject, html) {
    const mailer = getTransporter();

    if (!mailer || !to) {
        console.log("Email not sent: settings or recipient missing.");
        return false;
    }

    try {
        await mailer.sendMail({
            from: `"SHOPPING.CO" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log(`Email sent: ${subject}`);
        return true;
    } catch (error) {
        console.error("Email sending failed:", error.message);
        return false;
    }
}

// Existing admin notification function
async function sendAdminEmail(subject, html) {
    if (!process.env.ADMIN_EMAIL) {
        console.log("Admin email not sent: ADMIN_EMAIL is missing.");
        return false;
    }

    return sendEmail(
        process.env.ADMIN_EMAIL,
        subject,
        html
    );
}

module.exports = {
    sendEmail,
    sendAdminEmail,
};
