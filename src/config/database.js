const {Pool}= require('pg');
require('dotenv').config();

const {DATABASE_URL_AUTH_DB,DATABASE_URL_AUTH_DB_TEST}=process.env;
const  connectionString=process.env.NODE_ENV==='test'||process.env.NODE_ENV==='development'? process.env.DATABASE_URL_AUTH_DB_TEST:process.env.DATABASE_URL_AUTH_DB;

const pool=new Pool({
    connectionString:connectionString,
    ssl:process.env.NODE_ENV==='production'?{rejectUnauthorized:false}:false
});
module.exports=pool;