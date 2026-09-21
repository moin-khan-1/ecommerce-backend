const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/messages.json");

function ensureFile() {
    const directory = path.dirname(filePath);

    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]");
    }
}

function getMessages() {
    ensureFile();
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data || "[]");
}

function saveMessages(messages) {
    ensureFile();
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
}

module.exports = {
    getMessages,
    saveMessages,
};
