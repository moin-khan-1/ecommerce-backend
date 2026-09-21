const bcrypt = require("bcrypt");
const { getUsers, saveUsers } = require("../models/userModel");
const { sendAdminEmail } = require("../utils/email");

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const users = getUsers();

        const existingUser = users.find(
            (user) => user.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now(),
            name: String(name).trim(),
            email: String(email).trim(),
            password: hashedPassword
        };

        users.push(newUser);
        saveUsers(users);

        await sendAdminEmail(
            `New SHOP.CO signup: ${newUser.email}`,
            `
                <h2>New customer signup</h2>
                <p><strong>Name:</strong> ${newUser.name}</p>
                <p><strong>Email:</strong> ${newUser.email}</p>
            `
        );

        res.status(201).json({
            message: "Signup successful",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const users = getUsers();

        const user = users.find(
            (item) => item.email.toLowerCase() === email.toLowerCase()
        );

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        await sendAdminEmail(
            `SHOP.CO login: ${user.email}`,
            `
                <h2>Customer login</h2>
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            `
        );

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    signup,
    login
};
