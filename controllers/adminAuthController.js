const crypto = require("crypto");

function createAdminToken() {
    return crypto
        .createHmac("sha256", process.env.ADMIN_PASSWORD)
        .update(process.env.ADMIN_EMAIL.toLowerCase())
        .digest("hex");
}

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (!adminEmail || !adminPassword) {
            return res.status(500).json({
                message: "Admin credentials are not configured",
            });
        }

        if (
            email.trim().toLowerCase() !== adminEmail ||
            password !== adminPassword
        ) {
            return res.status(401).json({
                message: "Invalid admin email or password",
            });
        }

        const token = createAdminToken();

        res.json({
            message: "Admin login successful",
            token,
            admin: {
                name: "Moin Khan",
                email: adminEmail,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
    adminLogin,
};