
const oracledb = require('oracledb');
require('dotenv').config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
};

async function getConnection() {
    return await oracledb.getConnection(dbConfig);
}

module.exports = {
    oracledb,
    getConnection
};
