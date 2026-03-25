const supertest=require('supertest');
const app=require('../../src/app');
const { seedUsersWithRolePostsTestData,cleanDataBase} = require('../helpers/database.setup');
const { generateToken } = require('../helpers/auth.test.helper');
const { set } = require('supertest/lib/cookies');


const api=supertest(app);

describe('DELETE /api/posts/:id',()=>{
    let users;
    let ramdonUser;
    let mainUser;
    let adminUser;
    let tokenRamdonU;
    let tokenMainU;
    let tokenAdmin;
    beforeAll( async () => {
        users=await seedUsersWithRolePostsTestData();
        ramdonUser=users[0];
        mainUser=users[1];
        adminUser=users[2];
        tokenAdmin= generateToken(adminUser);
        tokenRamdonU=generateToken(ramdonUser);
        tokenMainU=generateToken(mainUser);
    })
    afterAll( async ()=>{
        await cleanDataBase();
    })
    const baseUrl='/api/posts/'
    it('It should work with 200 if delete was done by the owner',async()=>{
        const response = await api
            .delete(`${baseUrl}3`)
            .set('Authorization', `Bearer ${tokenMainU}`)
        expect(response.status).toBe(200)
    });
    
    it('It should work with 200 if delete was done by admin user',async () => {
        const response=await api
            .delete(`${baseUrl}2`)
            .set('Authorization',`Bearer ${tokenAdmin}`)
        expect(response.status).toBe(200)
    })

    it ('It should fail with 403 if delete was done by ramdon user',async () => {
        const response =await api
            .delete(`${baseUrl}4`)
            .set('Authorization',`Bearer ${tokenRamdonU}`)
        expect(response.status).toBe(403)
    })

    it('It should fail with 404 if try to delete a post that does not exist',async () => {
        const response=await api 
            .delete(`${baseUrl}233`)
            .set('Authorization',`Bearer ${tokenAdmin}`)
        expect(response.status).toBe(404)
    })

    it('It should fail with 400 if the post ID value of posts is invalid',async ()=>{
        const response=await api
            .delete(`${baseUrl}sdf3`)
            .set('Authorization',`Bearer ${tokenAdmin}`)
            expect(response.status).toBe(400)
    })

})