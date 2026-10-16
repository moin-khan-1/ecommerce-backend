const { getOrders, saveOrders } = require("../models/orderModel");
const { sendAdminEmail } = require("../utils/email");

const createOrder = async (req, res) => {
    try {
        const { customer, items, total } = req.body;

        if (!customer || !items || items.length === 0) {
            return res.status(400).json({
                message: "Customer and order items are required",
            });
        }

        const orders = await getOrders();

        const newOrder = {
            id: Date.now(),
            customer,
            items,
            total,
            status: "Pending",
            createdAt: new Date().toISOString(),
        };

        orders.push(newOrder);

        await saveOrders(orders);

        const itemRows = items
            .map(
                (item) => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.price * item.quantity}</td>
                    </tr>
                `
            )
            .join("");

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
                        <tr>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemRows}
                    </tbody>
                </table>

                <p><strong>Order Total: $${total}</strong></p>
            `
        );

        res.status(201).json({
            message: "Order created successfully",
            order: newOrder,
        });
    } catch (error) {
        console.error("Create order error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await getOrders();

        res.json(orders);
    } catch (error) {
        console.error("Get orders error:", error);

        res.status(500).json({
            message: "Failed to load orders",
        });
    }
};

// Customer's own orders
const getMyOrders = async (req, res) => {
    try {
        const email = String(req.query.email || "")
            .trim()
            .toLowerCase();

        if (!email) {
            return res.status(400).json({
                message: "Customer email is required",
            });
        }

        const orders = await getOrders();

        const myOrders = orders
            .filter(
                (order) =>
                    String(order.customer?.email || "")
                        .trim()
                        .toLowerCase() === email
            )
            .reverse();

        res.json(myOrders);
    } catch (error) {
        console.error("Get my orders error:", error);

        res.status(500).json({
            message: "Failed to load your orders",
        });
    }
};

// Customer can cancel/delete only Pending orders
const deleteMyOrder = async (req, res) => {
    try {
        const id = Number(req.params.id);

        const email = String(req.query.email || "")
            .trim()
            .toLowerCase();

        if (!email) {
            return res.status(400).json({
                message: "Customer email is required",
            });
        }

        const orders = await getOrders();

        const orderIndex = orders.findIndex(
            (order) =>
                Number(order.id) === id &&
                String(order.customer?.email || "")
                    .trim()
                    .toLowerCase() === email
        );

        if (orderIndex === -1) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        const order = orders[orderIndex];

        if (order.status !== "Pending") {
            return res.status(400).json({
                message:
                    "Only Pending orders can be cancelled.",
            });
        }

        orders.splice(orderIndex, 1);

        await saveOrders(orders);

        res.json({
            message: "Order cancelled successfully",
        });
    } catch (error) {
        console.error("Delete order error:", error);

        res.status(500).json({
            message: "Failed to cancel order",
        });
    }
};

module.exports = {
    createOrder,
    getAllOrders,
    getMyOrders,
    deleteMyOrder,
};