const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/orders.json");

const getOrders = () => {
    if (process.env.VERCEL) {
        return [];
    }

    if (!fs.existsSync(filePath)) {
        return [];
    }

    try {
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data || "[]");
    } catch (error) {
        console.error("Error reading orders:", error);
        return [];
    }
};

const saveOrders = (orders) => {
    if (process.env.VERCEL) {
        return true;
    }

    try {
        fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));
        return true;
    } catch (error) {
        console.error("Error saving orders:", error);
        return false;
    }
};

module.exports = {
    getOrders,
    saveOrders
};