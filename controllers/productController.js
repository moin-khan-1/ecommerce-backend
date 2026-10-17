
const {
    getProducts,
    getProductById,
} = require("../models/productModel");

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await getProducts();

        return res.json(products);
    } catch (error) {
        console.error("Get all products error:", error);

        return res.status(500).json({
            message: "Failed to load products",
        });
    }
};

// Get single product by ID
const getProductByIdController = async (req, res) => {
    try {
        const product = await getProductById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        return res.json(product);
    } catch (error) {
        console.error("Get product by ID error:", error);

        return res.status(500).json({
            message: "Failed to load product",
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById: getProductByIdController,
};
