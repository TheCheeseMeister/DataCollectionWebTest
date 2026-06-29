const sql = require("mssql");

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,

    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

let pool;

async function getConnection() {
    if (pool) return pool;

    pool = await sql.connect(config);
    console.log("DB pool initialized");
    return pool;
}

module.exports = {
    sql,
    getConnection
};