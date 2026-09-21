const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/products.json");

function getProducts() {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getProductById(id) {
    const products = getProducts();
    return products.find((product) => product.id === Number(id));
}

module.exports = {
    getProducts,
    getProductById
};
