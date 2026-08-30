const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/users.json");

const getUsers = () => {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
};

const saveUsers = (users) => {
    fs.writeFileSync(
        filePath,
        JSON.stringify(users, null, 2)
    );
};

module.exports = {
    getUsers,
    saveUsers
};