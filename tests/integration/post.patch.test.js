const supertest=require('supertest');
const app=require('../../src/app');
const {cleanDataBase, seedUsersWithRolePostsTestData}=require('../helpers/database.setup');
const {generateToken}=require('../helpers/auth.test.helper')

const api=supertest(app);
describe('PATCH /api/posts/:id',()=>{

    let postsIds;  
    let ramdonUser;
    let mainUser;
    let adminUser;
    let tokenRamdonU;
    let tokenMainU;
    let tokenAdmin;

    const baseUrl='/api/posts/'

    beforeAll(async () => {
        await cleanDataBase();
        const {users,postsId}=await seedUsersWithRolePostsTestData();
        ramdonUser=users[0];
        mainUser=users[1];
        adminUser=users[2];
        postsIds=postsId;
        tokenAdmin= generateToken(adminUser);
        tokenRamdonU=generateToken(ramdonUser);
        tokenMainU=generateToken(mainUser);
    })
    afterAll(async () => {
        await cleanDataBase()
    })

    describe('Tests Pass Successfully',()=>{
        it('status 200 if a post updated by the owner',async () => {
            const validPostId=postsIds[2];
            const response= await api
                .patch(`${baseUrl}${validPostId}`)
                .set('Authorization',`Bearer ${tokenMainU}`)
                .send({
                    title:"Pongase Serio socio"
                })
            expect(response.status).toBe(200)
        })

        it('status 200 if a post updated by the admin',async () => {
            const validPostId=postsIds[2];
            const response= await api
                .patch(`${baseUrl}${validPostId}`)
                .set('Authorization',`Bearer ${tokenAdmin}`)
                .send({
                    title:"Pongase Serio socio"
                })
            expect(response.status).toBe(200)
        })
    })

    describe('Tests Fail',()=>{
        it('status 403 if a post is updated by a random user',async () => {
            const validPostId=postsIds[2];
            const response=await api
                .patch(`${baseUrl}${validPostId}`)
                .set('Authorization',`Bearer ${tokenRamdonU}`)
                .send({
                    title:"Pongase Serio socio"
                })
            expect(response.status).toBe(403)
            expect(response.body).toMatchObject({
                success:false,
                error:"Access Denied. Insufficient Permissions"
            })
        })

        it('status 404 if a post does not exist', async () => {
            const invalidPostId=22
            
            const response= await api
                .patch(`${baseUrl}${invalidPostId}`)
                .set('Authorization',`Bearer ${tokenAdmin}`)
                .send({
                    title:"Pongase Serio socio"
                })
            
            expect(response.status).toBe(404)
            expect(response.body).toMatchObject({
                success:false,
                error:"The Post does not exist"
            })
        })
    })
})