const sql = require('mssql');

const config = {  
    user: process.env.DB_USER,  
    password: process.env.DB_PASSWORD,  
    server: process.env.DB_SERVER,  
    database: process.env.DB_NAME,  
    options: {  
        encrypt: true,  
        trustServerCertificate: true,  
    },  
};

async function getConnection() {  
    try {  
        const pool = await sql.connect(config);  
        return pool;  
    } catch (error) {  
        console.error('Erreur de connexion à la base de données', error);  
    }  
} 

module.exports = getConnection;