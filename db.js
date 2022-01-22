const mysql = require('mysql2');
const pool = mysql.createPool({
    user: "meta",
    password: "Frenchlick@10",
    host: "localhost",
    port: 3306,
    database: "metacare"
}) ;

  
  module.exports = pool;