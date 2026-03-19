const supertest=require('supertest');
const app=require('../../src/app');
const {cleanDataBase,cleanPostTable,seedUserTestData}=require('../helpers/database.setup');
const {generateToken,getDataById}=require('../helpers/auth.test.helper');
const api=supertest(app);

let token;
let userData;

describe('POST /api/post/',()=>{
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

describe('POST api/posts - Input validation ',()=>{
    beforeEach(async()=>{
        await cleanPostTable();
    })
    const baseUrl='/api/posts';

    it('It should fail with 400 if title is empty',async ()=>{
        const response=await api
            .post(baseUrl)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title:'',
                content:'Decido volverme más comprometido con mi carrera',
                published:true
            })
        console.log(response.body)
        expect(response.status).toBe(400)
        expect(response.body.errors).toContainEqual( { field: 'title', message: 'Title is required' })
    })

    it('It should fail with 400 if content is too short', async () => {
        const response=await api 
            .post(baseUrl)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title:'Ser un Profesional',
                content:'uwu',
                published:true
            })
            expect(response.status).toBe(400)
            expect(response.body.errors).toContainEqual(        {
              field: 'content',
              message: 'The content should be a least 20 characters'
            })
        })
    
    it('It should fail with 400 if category_ids is not an array', async () => {
        const response=await api
            .post(baseUrl)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title:'Ser un Profesional',
                content:'Como Midudev o Hector de León, asi de profesionales',
                category_ids:'',
                published:true
            })
        expect(response.status).toBe(400)
        expect(response.body.errors).toContainEqual({
            field:'category_ids',
            message:'Category_ids must be an Array'
        })
    })
    it('Is should fail with 400 if category_ids are not positive integers',async()=>{
        const response= await api
            .post(baseUrl)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title:'Ser un Profesional',
                content:'Como Midudev o Hector de León, asi de profesionales',
                category_ids:['hola pedrito'],
                published:true
            })
        expect(response.status).toBe(400)
        expect(response.body.errors).toContainEqual(        {
          field: 'category_ids[0]',
          message: 'Category_ids values must be positive integers greater than 1'
        })
    })
})
