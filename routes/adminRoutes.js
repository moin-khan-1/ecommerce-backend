const express = require("express");

const adminMiddleware = require("../middleware/adminMiddleware");

const {
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
} = require("../controllers/adminController");

const router = express.Router();

router.use(adminMiddleware);

router.get("/dashboard", dashboard);

router.get("/products", getAdminProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

router.get("/orders", getAdminOrders);
router.put("/orders/:id", updateOrder);

router.get("/users", getAdminUsers);

router.get("/messages", getAdminMessages);
router.put("/messages/:id", updateMessage);

module.exports = router;
