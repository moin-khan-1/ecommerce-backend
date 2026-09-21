const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/users.json");

function ensureFile() {
    const directory = path.dirname(filePath);

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]");
    }
}

const getUsers = () => {
    ensureFile();
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
};

const saveUsers = (users) => {
    ensureFile();
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
};

module.exports = {
    getUsers,
    saveUsers
};
