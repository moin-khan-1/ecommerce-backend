
const {
    getProducts,
    saveProducts,
} = require("../models/productModel");

const {
    getOrders,
    saveOrders,
} = require("../models/orderModel");

const { getUsers } = require("../models/userModel");

const {
    getMessages,
    saveMessages,
} = require("../models/messageModel");

// Admin Dashboard
async function dashboard(req, res) {
    try {
        const products = await getProducts();
        const orders = await getOrders();
        const users = await getUsers();
        const messages = getMessages();

        res.json({
            totalProducts: products.length,
            totalOrders: orders.length,
            totalUsers: users.length,
            totalMessages: messages.filter(
                (item) => item.status === "New"
            ).length,
            recentOrders: [...orders].reverse().slice(0, 5),
        });
    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            message: "Failed to load dashboard",
        });
    }
}

// Get all products for admin
async function getAdminProducts(req, res) {
    try {
        const products = await getProducts();
        res.json(products);
    } catch (error) {
        console.error("Get admin products error:", error);

        res.status(500).json({
            message: "Failed to load products",
        });
    }
}

// Create product
async function createProduct(req, res) {
    try {
        const {
            name,
            price,
            category,
            image,
            section,
        } = req.body;

        if (
            !name ||
            price === undefined ||
            price === null ||
            price === "" ||
            !category ||
            !image ||
            !section
        ) {
            return res.status(400).json({
                message: "All product fields are required",
            });
        }

        const numericPrice = Number(price);

        if (!Number.isFinite(numericPrice) || numericPrice < 0) {
            return res.status(400).json({
                message: "Price must be a valid non-negative number",
            });
        }

        const products = await getProducts();

        const numericIds = products
            .map((item) => Number(item.id))
            .filter(Number.isFinite);

        const newProduct = {
            id: numericIds.length
                ? Math.max(...numericIds) + 1
                : 1,
            name: String(name).trim(),
            price: numericPrice,
            category: String(category).trim(),
            image: String(image).trim(),
            section: String(section).trim(),
        };

        products.push(newProduct);

        await saveProducts(products);

        return res.status(201).json({
            message: "Product created successfully",
            product: newProduct,
        });
    } catch (error) {
        console.error("Create product error:", error);

        return res.status(500).json({
            message: "Failed to create product",
        });
    }
}

// Update product
async function updateProduct(req, res) {
    try {
        const products = await getProducts();
        const id = Number(req.params.id);

        const index = products.findIndex(
            (item) => Number(item.id) === id
        );

        if (index === -1) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        const {
            name,
            price,
            category,
            image,
            section,
        } = req.body;

        const updatedPrice =
            price === undefined || price === ""
                ? products[index].price
                : Number(price);

        if (
            !Number.isFinite(Number(updatedPrice)) ||
            Number(updatedPrice) < 0
        ) {
            return res.status(400).json({
                message: "Price must be a valid non-negative number",
            });
        }

        products[index] = {
            ...products[index],
            name: name
                ? String(name).trim()
                : products[index].name,
            price: Number(updatedPrice),
            category: category
                ? String(category).trim()
                : products[index].category,
            image: image
                ? String(image).trim()
                : products[index].image,
            section: section
                ? String(section).trim()
                : products[index].section,
        };

        await saveProducts(products);

        return res.json({
            message: "Product updated successfully",
            product: products[index],
        });
    } catch (error) {
        console.error("Update product error:", error);

        return res.status(500).json({
            message: "Failed to update product",
        });
    }
}

// Delete product
async function deleteProduct(req, res) {
    try {
        const products = await getProducts();
        const id = Number(req.params.id);

        const filtered = products.filter(
            (item) => Number(item.id) !== id
        );

        if (filtered.length === products.length) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        await saveProducts(filtered);

        return res.json({
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("Delete product error:", error);

        return res.status(500).json({
            message: "Failed to delete product",
        });
    }
}

// Get all orders for admin
async function getAdminOrders(req, res) {
    try {
        const orders = await getOrders();

        res.json([...orders].reverse());
    } catch (error) {
        console.error("Admin orders error:", error);

        res.status(500).json({
            message: "Failed to load orders",
        });
    }
}

// Update order status
async function updateOrder(req, res) {
    try {
        const orders = await getOrders();
        const id = Number(req.params.id);

        const order = orders.find(
            (item) => Number(item.id) === id
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        const allowedStatuses = [
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled",
        ];

        if (!allowedStatuses.includes(req.body.status)) {
            return res.status(400).json({
                message: "Invalid order status",
            });
        }

        order.status = req.body.status;
        order.updatedAt = new Date().toISOString();

        await saveOrders(orders);

        return res.json({
            message: "Order status updated",
            order,
        });
    } catch (error) {
        console.error("Update order error:", error);

        res.status(500).json({
            message: "Failed to update order",
        });
    }
}

// Get users without passwords
async function getAdminUsers(req, res) {
    try {
        const users = await getUsers();

        const safeUsers = users.map(
            ({ password, ...safeUser }) => safeUser
        );

        res.json(safeUsers);
    } catch (error) {
        console.error("Admin users error:", error);

        res.status(500).json({
            message: "Failed to load users",
        });
    }
}

// Get messages
function getAdminMessages(req, res) {
    try {
        res.json([...getMessages()].reverse());
    } catch (error) {
        console.error("Admin messages error:", error);

        res.status(500).json({
            message: "Failed to load messages",
        });
    }
}

// Update message status
function updateMessage(req, res) {
    try {
        const messages = getMessages();
        const id = Number(req.params.id);

        const message = messages.find(
            (item) => Number(item.id) === id
        );

        if (!message) {
            return res.status(404).json({
                message: "Message not found",
            });
        }

        const allowedStatuses = ["New", "Read", "Replied"];

        if (!allowedStatuses.includes(req.body.status)) {
            return res.status(400).json({
                message: "Invalid message status",
            });
        }

        message.status = req.body.status;
        saveMessages(messages);

        return res.json({
            message: "Message status updated",
            item: message,
        });
    } catch (error) {
        console.error("Update message error:", error);

        res.status(500).json({
            message: "Failed to update message",
        });
    }
}

module.exports = {
    dashboard,
    getAdminProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getAdminOrders,
    updateOrder,
    getAdminUsers,
    getAdminMessages,
    updateMessage,
};
