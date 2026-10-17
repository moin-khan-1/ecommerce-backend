
const bcrypt = require("bcrypt");

const {
    getUsers,
    saveUsers,
} = require("../models/userModel");

const {
    sendAdminEmail,
    sendEmail,
} = require("../utils/email");

const signup = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const users = await getUsers();

        const cleanEmail = String(email)
            .trim()
            .toLowerCase();

        const existingUser = users.find(
            (user) =>
                String(user.email)
                    .trim()
                    .toLowerCase() === cleanEmail
        );

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const newUser = {
            id: Date.now(),
            name: String(name).trim(),
            email: cleanEmail,
            password: hashedPassword,
        };

        users.push(newUser);

        await saveUsers(users);

        // Notify admin about the new signup
        try {
            await sendAdminEmail(
                `New SHOPPING.CO signup: ${newUser.email}`,
                `
                    <h2>New Customer Signup</h2>
                    <p><strong>Name:</strong> ${newUser.name}</p>
                    <p><strong>Email:</strong> ${newUser.email}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                `
            );
        } catch (emailError) {
            console.error(
                "Signup admin email failed:",
                emailError.message
            );
        }

        // Send welcome email to the customer
        try {
            await sendEmail(
                newUser.email,
                "Welcome to SHOPPING.CO!",
                `
                    <h2>Welcome to SHOPPING.CO, ${newUser.name}!</h2>
                    <p>Your account has been created successfully.</p>
                    <p>You can now log in and start shopping with us.</p>
                    <p>Thank you for joining SHOPPING.CO!</p>
                `
            );
        } catch (emailError) {
            console.error(
                "Signup customer email failed:",
                emailError.message
            );
        }

        return res.status(201).json({
            message: "Signup successful",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};

const login = async (req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const users = await getUsers();

        const cleanEmail = String(email)
            .trim()
            .toLowerCase();

        const user = users.find(
            (item) =>
                String(item.email)
                    .trim()
                    .toLowerCase() === cleanEmail
        );

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // Notify admin about the successful login
        try {
            await sendAdminEmail(
                `SHOPPING.CO login: ${user.email}`,
                `
                    <h2>Customer Login</h2>
                    <p><strong>Name:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                `
            );
        } catch (emailError) {
            console.error(
                "Login admin email failed:",
                emailError.message
            );
        }

        // Notify customer about the successful login
        try {
            await sendEmail(
                user.email,
                "New login to your SHOPPING.CO account",
                `
                    <h2>Hello ${user.name},</h2>
                    <p>You have successfully logged in to your SHOPPING.CO account.</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                    <p>If this login was not made by you, please contact our support team.</p>
                `
            );
        } catch (emailError) {
            console.error(
                "Login customer email failed:",
                emailError.message
            );
        }

        return res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
    signup,
    login,
};
