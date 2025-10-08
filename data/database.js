const mysql = require('mysql2/promise');


const pool = mysql.createPool({
    host: 'localhost',
    database: 'sakalintern',
    user: 'root',
    password: "Snehal@1234"

});
module.exports = pool;