const { getOrders, saveOrders } = require("../models/orderModel");

const createOrder = (req, res) => {
    try {
        const { customer, items, total } = req.body;

        if (!customer || !items || items.length === 0) {
            return res.status(400).json({
                message: "Customer and order items are required"
            });
        }

        const orders = getOrders();

        const newOrder = {
            id: Date.now(),
            customer,
            items,
            total,
            status: "Pending",
            createdAt: new Date().toISOString()
        };

        orders.push(newOrder);
        saveOrders(orders);

        res.status(201).json({
            message: "Order created successfully",
            order: newOrder
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error"
        });
    }
};

const getAllOrders = (req, res) => {
    const orders = getOrders();

    res.json(orders);
};

module.exports = {
    createOrder,
    getAllOrders
};