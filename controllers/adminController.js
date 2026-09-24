const { getProducts } = require("../models/productModel");
const fs = require("fs");
const path = require("path");
const { getOrders, saveOrders } = require("../models/orderModel");
const { getUsers } = require("../models/userModel");
const { getMessages, saveMessages } = require("../models/messageModel");

const productsFile = path.join(__dirname, "../data/products.json");

function saveProducts(products) {
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 4));
}

async function dashboard(req, res) {
    try {
        const products = getProducts();
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

function getAdminProducts(req, res) {
    res.json(getProducts());
}

function createProduct(req, res) {
    const { name, price, category, image, section } = req.body;

    if (!name || price === undefined || !category || !image || !section) {
        return res.status(400).json({
            message: "All product fields are required",
        });
    }

    const products = getProducts();

    const newProduct = {
        id: products.length
            ? Math.max(...products.map((item) => Number(item.id))) + 1
            : 1,
        name: String(name).trim(),
        price: Number(price),
        category,
        image,
        section,
    };

    products.push(newProduct);
    saveProducts(products);

    res.status(201).json({
        message: "Product created successfully",
        product: newProduct,
    });
}

function updateProduct(req, res) {
    const products = getProducts();
    const id = Number(req.params.id);
    const index = products.findIndex((item) => item.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Product not found",
        });
    }

    const { name, price, category, image, section } = req.body;

    products[index] = {
        ...products[index],
        name: String(name || products[index].name).trim(),
        price: Number(price ?? products[index].price),
        category: category || products[index].category,
        image: image || products[index].image,
        section: section || products[index].section,
    };

    saveProducts(products);

    res.json({
        message: "Product updated successfully",
        product: products[index],
    });
}

function deleteProduct(req, res) {
    const products = getProducts();
    const id = Number(req.params.id);
    const filtered = products.filter((item) => item.id !== id);

    if (filtered.length === products.length) {
        return res.status(404).json({
            message: "Product not found",
        });
    }

    saveProducts(filtered);

    res.json({
        message: "Product deleted successfully",
    });
}

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

async function updateOrder(req, res) {
    try {
        const orders = await getOrders();
        const id = Number(req.params.id);

        const order = orders.find((item) => item.id === id);

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

        res.json({
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

async function getAdminUsers(req, res) {
    try {
        const users = await getUsers();

        const safeUsers = users.map(({ password, ...safeUser }) => safeUser);

        res.json(safeUsers);
    } catch (error) {
        console.error("Admin users error:", error);

        res.status(500).json({
            message: "Failed to load users",
        });
    }
}

function getAdminMessages(req, res) {
    res.json([...getMessages()].reverse());
}

function updateMessage(req, res) {
    const messages = getMessages();
    const id = Number(req.params.id);

    const message = messages.find((item) => item.id === id);

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

    res.json({
        message: "Message status updated",
        item: message,
    });
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