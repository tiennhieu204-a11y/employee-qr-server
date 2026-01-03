const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// DB tạm (RAM)
const tokens = {};

// API tạo QR
app.get("/api/qr", (req, res) => {
    const token = uuidv4();
    const expireAt = Date.now() + 12 * 60 * 60 * 1000;

    tokens[token] = {
        expireAt,
        used: false
    };

    res.json({ token, expireAt });
});

// API xác thực QR
app.post("/api/verify", (req, res) => {
    const { token } = req.body;

    if (!tokens[token]) {
        return res.status(400).json({ result: "INVALID" });
    }

    const data = tokens[token];

    if (Date.now() > data.expireAt) {
        return res.status(403).json({ result: "EXPIRED" });
    }

    if (data.used) {
        return res.status(403).json({ result: "USED" });
    }

    data.used = true;
    res.json({ result: "OK" });
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
