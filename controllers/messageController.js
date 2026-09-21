const { getMessages, saveMessages } = require("../models/messageModel");
const { sendAdminEmail } = require("../utils/email");

async function createMessage(req, res) {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                message: "Name, email and message are required",
            });
        }

        const messages = getMessages();

        const newMessage = {
            id: Date.now(),
            name: String(name).trim(),
            email: String(email).trim(),
            message: String(message).trim(),
            status: "New",
            createdAt: new Date().toISOString(),
        };

        messages.push(newMessage);
        saveMessages(messages);

        await sendAdminEmail(
            `New SHOP.CO message from ${newMessage.name}`,
            `
                <h2>New customer message</h2>
                <p><strong>Name:</strong> ${newMessage.name}</p>
                <p><strong>Email:</strong> ${newMessage.email}</p>
                <p><strong>Message:</strong></p>
                <p>${newMessage.message}</p>
            `
        );

        res.status(201).json({
            message: "Message sent successfully",
            item: newMessage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
}

module.exports = {
    createMessage,
};
