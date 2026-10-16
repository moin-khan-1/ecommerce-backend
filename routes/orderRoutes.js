const express = require("express");

const {
    createOrder,
    getAllOrders,
    getMyOrders,
    deleteMyOrder,
} = require("../controllers/orderController");

const router = express.Router();

// Create order
router.post("/", createOrder);

// Admin/general orders endpoint
router.get("/", getAllOrders);

// Customer's own orders
router.get("/my-orders", getMyOrders);

// Customer cancels a Pending order
router.delete("/:id", deleteMyOrder);

module.exports = router;