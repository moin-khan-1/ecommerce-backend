const { getOrders, saveOrders } = require("../models/orderModel");
const { sendAdminEmail } = require("../utils/email");

const createOrder = async (req, res) => {
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

        const itemRows = items.map((item) => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.price * item.quantity}</td>
            </tr>
        `).join("");

        await sendAdminEmail(
            `New SHOP.CO order #${String(newOrder.id).slice(-6)}`,
            `
                <h2>New order received</h2>
                <p><strong>Customer:</strong> ${customer.name}</p>
                <p><strong>Email:</strong> ${customer.email}</p>
                <p><strong>Phone:</strong> ${customer.phone || "-"}</p>
                <p><strong>Address:</strong> ${customer.address}, ${customer.city}</p>
                <table border="1" cellpadding="8" cellspacing="0">
                    <thead>
                        <tr><th>Product</th><th>Qty</th><th>Total</th></tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                </table>
                <p><strong>Order Total: $${total}</strong></p>
            `
        );

        res.status(201).json({
            message: "Order created successfully",
            order: newOrder
        });
    } catch (error) {
        console.error(error);
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
