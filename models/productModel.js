
const fs = require("fs");
const path = require("path");
const { put, get } = require("@vercel/blob");

const BLOB_PATH = "products/products.json";

const localFilePath = path.join(
    __dirname,
    "../data/products.json"
);

const hasBlobCredentials =
    Boolean(process.env.BLOB_READ_WRITE_TOKEN) ||
    Boolean(process.env.VERCEL_OIDC_TOKEN);

function readLocalProducts() {
    const data = fs.readFileSync(localFilePath, "utf8");
    return JSON.parse(data || "[]");
}

async function getProducts() {
    // Local development: use the local JSON file.
    if (!hasBlobCredentials) {
        return readLocalProducts();
    }

    try {
        const result = await get(BLOB_PATH, {
            access: "private",
            useCache: false,
        });

        if (result && result.stream) {
            const text = await new Response(
                result.stream
            ).text();

            return JSON.parse(text || "[]");
        }

        // First deployment: preserve the existing bundled catalog.
        return readLocalProducts();
    } catch (error) {
        // Only fall back when the Blob object does not exist.
        // Do not hide authentication or other storage errors.
        const message = String(
            error.message || ""
        ).toLowerCase();

        const missingObject =
            error.status === 404 ||
            error.statusCode === 404 ||
            message.includes("not found");

        if (missingObject) {
            return readLocalProducts();
        }

        console.error(
            "Error reading products from Blob:",
            error
        );

        throw error;
    }
}

async function saveProducts(products) {
    if (!hasBlobCredentials) {
        if (process.env.VERCEL) {
            throw new Error(
                "Blob credentials are missing in Vercel environment variables."
            );
        }

        fs.writeFileSync(
            localFilePath,
            JSON.stringify(products, null, 2)
        );

        return true;
    }

    await put(
        BLOB_PATH,
        JSON.stringify(products, null, 2),
        {
            access: "private",
            contentType: "application/json",
            addRandomSuffix: false,
            allowOverwrite: true,
        }
    );

    return true;
}

async function getProductById(id) {
    const products = await getProducts();

    return products.find(
        (product) => Number(product.id) === Number(id)
    );
}

module.exports = {
    getProducts,
    saveProducts,
    getProductById,
};
