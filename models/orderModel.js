const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/orders.json");

function ensureFile() {
    const directory = path.dirname(filePath);

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]");
    }
}

const getOrders = () => {
    ensureFile();

    try {
        const data = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(data || "[]");
    } catch (error) {
        console.error("Error reading orders:", error);
        return [];
    }
};

const saveOrders = (orders) => {
    try {
        ensureFile();
        fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));
        return true;
    } catch (error) {
        // Vercel filesystem is read-only
        console.log("Order file save skipped:", error.code);
        return false;
    }
};

module.exports = {
    getOrders,
    saveOrders
};