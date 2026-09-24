const { put, get } = require("@vercel/blob");

const BLOB_PATH = "users/users.json";

const getUsers = async () => {
    try {
        const result = await get(BLOB_PATH, {
            access: "private",
            useCache: false,
        });

        if (!result || !result.stream) {
            return [];
        }

        const text = await new Response(result.stream).text();

        return JSON.parse(text || "[]");
    } catch (error) {
        console.error("Error reading users from Blob:", error);
        return [];
    }
};

const saveUsers = async (users) => {
    try {
        await put(
            BLOB_PATH,
            JSON.stringify(users, null, 2),
            {
                access: "private",
                contentType: "application/json",
                addRandomSuffix: false,
                allowOverwrite: true,
            }
        );

        return true;
    } catch (error) {
        console.error("Error saving users to Blob:", error);
        throw error;
    }
};

module.exports = {
    getUsers,
    saveUsers,
};