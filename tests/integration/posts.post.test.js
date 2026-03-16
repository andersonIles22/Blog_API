const supertest=require('supertest');
const app=require('../../src/app');
const {cleanDataBase,cleanPostTable,seedUserTestData}=require('../helpers/database.setup');
const {generateToken,getDataById}=require('../helpers/auth.test.helper');
const api=supertest(app);

describe('POST /api/post/',()=>{
    let token;
    let userData;
    beforeAll(async () => {
        userData=await seedUserTestData();
        token=await generateToken(userData);
    })

    afterAll(async () => {
        await cleanDataBase();
    })
    
    beforeEach(async()=>{
        await cleanPostTable();
    });
    const baseUrl='/api/posts';
    it('Post created succesfully',async()=>{
        const response= await api
            .post(baseUrl)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title:'Doramas',
                content:'Trata sobre un hombre que quiere saber el objetivo en la tierra',
                published:true
            })
        expect(response.status).toBe(201);
    });


    it('No Authorization',async () => {
        const response=await api
            .post(baseUrl)
        expect(response.status).toBe(401);
    })

    it('The post have the correct author_id',async () => {
        const response=await api
            .post(baseUrl)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title:'Doramas',
                content:'Trata sobre un hombre que quiere saber el objetivo en la tierra',
                published:true
            })
       expect(response.body.data.author_id).toBe(userData.id)
    })  
})