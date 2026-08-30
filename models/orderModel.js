const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/orders.json");

const getOrders = () => {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
};

const saveOrders = (orders) => {
    fs.writeFileSync(
        filePath,
        JSON.stringify(orders, null, 2)
    );
};

module.exports = {
    getOrders,
    saveOrders
};