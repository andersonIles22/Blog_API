const {closeConnection}=require('../tests/helpers/database.setup');

afterAll(async()=>{
    await closeConnection()
})