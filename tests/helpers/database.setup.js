const db=require('../../src/config/database');
const bcrypt=require('bcryptjs');

const cleanDataBase= async()=>{
    await db.query(`
        TRUNCATE TABLE users RESTART IDENTITY CASCADE;
        TRUNCATE TABLE categories RESTART IDENTITY CASCADE
        `);
};

const cleanPostTable= async () => {
    await db.query(
      `TRUNCATE TABLE posts RESTART IDENTITY CASCADE`
    )
}

const closeConnection= async()=>{
    await db.end();
}

const seedUserTestData=async () => {
  const rawPassword='PasswordxD';
  const hashedPass=await bcrypt.hash(rawPassword,10);

  const getUserQuery=await db.query(`
    INSERT INTO users (email,password,name)
    VALUES ($1,$2,$3)
    RETURNING id,email,role`,['onlyuser@gmail.com',hashedPass,'El Admin'])
  return getUserQuery.rows[0]
}
const seedUsersWithRolePostsTestData=async()=>{
  //Insert Users
  await db.query(`
    INSERT INTO users (email,password,name)
    VALUES ('onlyUser@gmail.com','PasswordxD','El Admin'),
    ('youknowthis@gmail.com','PasswordxD','User Ramdon'),
    ('tellaprettylies@gmail.com','PasswordxD','The User')
    RETURNING id,email,role`)
  // Update one Role to Admin
  await db.query(
    `UPDATE users
    SET role='admin'
    WHERE id=1
    `
  );
  await db.query(`
    INSERT INTO posts (title,content,author_id)
    VALUES ('Life', 'Dime que funciona', 1),
      ('Dont die','Dime que funciona',1),
      ('Do not lie to me','Dime que funciona',3),
      ('The worst party','Dime que funciona',3),
      ('My house is so big','Dime que funciona',2)
    `
  );
  const getUsersQuery= await db.query(`
    SELECT id,email,role FROM users
    `);
  const getPostsIdQuery=await db.query(`
    SELECT id FROM posts
    `);
  return{
    users:getUsersQuery.rows,
    postsId:getPostsIdQuery.rows.map(obj=>obj.id)
  }
};

const seedUsersPostsCategoriesTestData = async () => {
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
   const getInfo=await db.query(`
    INSERT INTO posts (title,content,author_id)
    VALUES ('Life', 'Dime que funciona', 1),
      ('Dont die','Dime que funciona',1),
      ('Do not lie to me','Dime que funciona',3),
      ('The worst party','Dime que funciona',2),
      ('My house is so big','Dime que funciona',4)
    RETURNING *
  `);
  //Retornar un array con los IDs de los posts
  const arrayPostIds=getInfo.rows.map((obj)=>obj.id)
    // Insertarmos categorias
  await db.query(`
    INSERT INTO categories (name)
    VALUES ('personal life'), ('work'), ('experiences'), ('vacation')
    `)
    // Insertamos data a la tabla de categorias de los posts
  const dataPostCategories=`(1,'1'),(2,'2'),(3,'1'),(4,'3'),(5,'4')`;
  await db.query(
    `INSERT INTO post_categories (post_id, category_id) VALUES ${dataPostCategories}`
  )
  return arrayPostIds
};

const getUsersTestData= async () => {
  const users=await db.query(`
    SELECT * FROM users;
    `);
  return users.rows;
}

const updatePublishedPostTestData=async () => {
  await db.query(`
    UPDATE posts
    SET published=true
    WHERE id=3
    `)
}


module.exports={
    cleanDataBase,
    cleanPostTable,
    closeConnection,
    seedUserTestData,
    seedUsersWithRolePostsTestData,
    seedUsersPostsCategoriesTestData,
    updatePublishedPostTestData,
    getUsersTestData
}