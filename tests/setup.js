const {closeConnection}=require('./helpers/database.setup.js')

afterAll(async()=>{
    await closeConnection()
})