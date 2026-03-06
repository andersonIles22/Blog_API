const db=require('../../config/database');

const cleanDataBase= async()=>{
    await db.query(`
        TRUNCATE TABLE users RESTART IDENTITY CASCADE;
        TRUNCATE TABLE categories RESTART IDENTITY CASCADE;
        `);
};

const closeConnection= async()=>{
    await db.end();
}

const seedTestData = async () => {
  // Usuario de prueba
  await db.query(`
    INSERT INTO users (email, password,name)
    VALUES ('test@example.com', 'hashed_password', 'Pepe'),
      ('mano@gmail.com','hashed_password','Juan'),
      ('foot@gmail.com','hashed_password','Fracisco'),
      ('waos@gmail.com','hashed_password','Marta'),
      ('who@gmail.com','hashed_password','Laura')
  `);
  
  // Categorías de prueba
  await db.query(`
    INSERT INTO categories (name)
    VALUES ('personal life'), ('work'), ('experiences'), ('vacation')
  `);
};

module.exports={
    cleanDataBase,
    closeConnection,
    seedTestData
}