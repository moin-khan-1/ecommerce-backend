const { getProducts } = require("../models/productModel");

const getAllProducts = (req, res) => {
    const products = getProducts();

    res.json(products);
};

const getProductById = (req, res) => {
    const products = getProducts();

    const product = products.find(
        (item) => item.id === Number(req.params.id)
    );

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }

    res.json(product);
};

module.exports = {
    getAllProducts,
    getProductById
};