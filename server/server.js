require("dotenv").config();

const express = require('express');
const app = express();
const cors = require("cors");

// Routes
const verificationRoutes = require("./routes/VerificationResult");

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5000"
];

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());
app.use("/api/verificationResult", verificationRoutes);

/*app.get("/api", (req, res) => {
    res.json({"users": ["User1", "User2", "User3"]});
})

const { getConnection } = require("./db");
app.get("/api/users", async (req, res) => {
    try {
        const pool = await getConnection();

        const result = await pool.request().query(`
            SELECT * FROM tblCertificateVerificationResult
        `);

        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});*/

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {console.log(`Server started on port ${PORT}`)});