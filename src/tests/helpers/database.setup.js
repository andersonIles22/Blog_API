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
    VALUES ('test@example.com', 'Dime que funciona', 'Pepe'),
      ('mano@gmail.com','Dime que funciona','Juan'),
      ('foot@gmail.com','Dime que funciona','Fracisco'),
      ('waos@gmail.com','Dime que funciona','Marta'),
      ('who@gmail.com','Dime que funciona','Laura')
  `);
  
  //Post de pruebas
   await db.query(`
    INSERT INTO posts (title,content,author_id)
    VALUES ('Life', 'Dime que funciona', 1),
      ('Dont die','Dime que funciona',1),
      ('Do not lie to me','Dime que funciona',3),
      ('The worst party','Dime que funciona',2),
      ('My house is so big','Dime que funciona',4)
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