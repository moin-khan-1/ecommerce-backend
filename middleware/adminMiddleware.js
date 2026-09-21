const crypto = require("crypto");

function adminMiddleware(req, res, next) {
    const configuredAdminEmail = process.env.ADMIN_EMAIL;
    const configuredAdminPassword = process.env.ADMIN_PASSWORD;

    if (!configuredAdminEmail || !configuredAdminPassword) {
        return res.status(500).json({
            message: "Admin credentials are not configured",
        });
    }

    const requestToken = String(
        req.headers["x-admin-token"] || ""
    ).trim();

    const expectedToken = crypto
        .createHmac("sha256", configuredAdminPassword)
        .update(configuredAdminEmail.trim().toLowerCase())
        .digest("hex");

    if (
        !requestToken ||
        requestToken.length !== expectedToken.length ||
        !crypto.timingSafeEqual(
            Buffer.from(requestToken),
            Buffer.from(expectedToken)
        )
    ) {
        return res.status(403).json({
            message: "Admin access denied",
        });
    }

    next();
}

module.exports = adminMiddleware;