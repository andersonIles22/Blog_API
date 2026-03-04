const db=require('../../config/database');

const cleanDataBase= async()=>{
    await db.query(`
        TRUNCATE TABLE users RESTART IDENTITY CASCADE
        `);
};

const closeConnection= async()=>{
    await db.end();
}

const seedTestData = async () => {
  // Usuario de prueba
  await db.query(`
    INSERT INTO users (email, password,name)
    VALUES ('test@example.com', 'hashed_password', 'Pepe')
  `);
  
  // Categorías de prueba
  await db.query(`
    INSERT INTO categories (name)
    VALUES ('personal life'), ('work'), ('experiences'), (vacation)
  `);
};

module.exports={
    cleanDataBase,
    closeConnection,
    seedTestData
}