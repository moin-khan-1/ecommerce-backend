const { put, get } = require("@vercel/blob");

const BLOB_PATH = "orders/orders.json";

const getOrders = async () => {
    try {
        const result = await get(BLOB_PATH, {
            access: "private",
        });

        if (!result) {
            return [];
        }

        const text = await new Response(result.stream).text();
        return JSON.parse(text || "[]");
    } catch (error) {
        if (
            error?.name === "BlobNotFoundError" ||
            error?.message?.includes("not found")
        ) {
            return [];
        }

        console.error("Error reading orders:", error);
        return [];
    }
};

const saveOrders = async (orders) => {
    await put(
        BLOB_PATH,
        JSON.stringify(orders, null, 2),
        {
            access: "private",
            contentType: "application/json",
            addRandomSuffix: false,
            allowOverwrite: true,
        }
    );

    return true;
};

module.exports = {
    getOrders,
    saveOrders,
};