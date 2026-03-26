const supertest=require('supertest');
const app=require('../../src/app');
const { seedUserTestData, cleanDataBase } = require('../helpers/database.setup');


const api=supertest(app);

describe('POST /api/auth/register/ - Input Validations',()=>{

    beforeEach(async()=>{
        await seedUserTestData();
    })

    afterEach(async () => {
        await cleanDataBase(); 
    })

    const baseUrl='/api/auth/register';
    test.each([
        {
            desc:'the email field is empty',
            data:{email:'',password:'PasswordxD',name:'Test'},
            expectedError:'Email is required',
            expectedStatus:400
        },
        {
            desc:'the email is invalid',
            data:{email:"onlyuser@.com",password:'PasswordxD',name:'Test'},
            expectedError:'Valid email required',
            expectedStatus:400
        },
        {
            desc:'the password is too short',
            data:{email:"onlyuser@hotmal.com",password:'Passw',name:'Test'},
            expectedError:'Password must be at least 6 characters',
            expectedStatus:400
        },
        {
            desc:'the name field is empty',
            data:{email:"onlyuser@hotmal.com",password:'PasswordxD',name:''},
            expectedError:'Name is required',
            expectedStatus:400
        },
        {
            desc:'the name is too long',
            data:{email:"onlyuser@hotmal.com",password:'PasswordxD',name:'ulDzqPaNjwOTLrWqiWZRILKifHmXoKEunJJYDwrAimtwruEvVcbXzBvFrqbNNkqO'},
            expectedError:'Name too long',
            expectedStatus:400
        }  

    ])(`Shoul fail if $desc`, async ({data,expectedError,expectedStatus}) => {
        const response= await api
            .post(baseUrl)
            .send(data)
        expect(response.status).toBe(expectedStatus)
        expect(response.body.errors).toContainEqual(
            expect.objectContaining({message:expectedError})
        )
    })
});

describe('POST /api/auth/register/ - Duplicate Email Validation',() => {
    beforeEach(async()=>{
    await seedUserTestData();
    })

    afterEach(async () => {
        await cleanDataBase(); 
    })
    const baseUrl='/api/auth/register/';

    it ('Should fail with 409 if email already registered', async () => {
        const response= await api
            .post(baseUrl)
            .send({
                email:'onlyuser@gmail.com',
                password:'PasswordxD',
                name:'El Admin'
            })
        expect(response.status).toBe(409)
        expect(response.body).toMatchObject({error: 'Email already registered'})
    })
})

describe('POST /api/auth/register/ - Register Succesfully',()=>{
    beforeEach(async()=>{
      await seedUserTestData();
    })

    afterEach(async () => {
        await cleanDataBase(); 
    })
    const baseUrl='/api/auth/register/';

    it('Should work with 201 if register is successful',async () => {
        const response=await api
            .post(baseUrl)
            .send({
                email:'projecthailmary@gmail.com',
                password:'PasswordxD',
                name:'alone'
            })
        expect(response.status).toBe(201)
        expect(response.body).toMatchObject({
            success:true,
            data:expect.any(Object)
        })
    })

})

describe('POST /api/auth/login - Input Validations', ()=>{
    beforeAll(async()=>{
      await seedUserTestData();
    })

    afterAll(async () => {
        await cleanDataBase(); 
    })

    const baseUrl='/api/auth/login';

    it.each([
        {
            desc:'the email has an invalid format',
            data:{email:'onlyuser@gmail....com',password:'PasswordxD'},
            expectedError:'Valid email required',
            expectedStatus:400
        },
        {
            desc:'the field password is empty',
            data:{email:'onlyuser@gmail.com',password:''},
            expectedError:'Password required',
            expectedStatus:400
        }
    ])(`Shoul fail if $desc`, async ({data,expectedError,expectedStatus}) => {
        const response= await api
            .post(baseUrl)
            .send(data)
        expect(response.status).toBe(expectedStatus)
        expect(response.body.errors).toContainEqual(
            expect.objectContaining({message:expectedError})
        )
    })
})

describe('Post /api/auth/login - Login Succesful',()=>{
       let check
    beforeAll(async()=>{
      check=await seedUserTestData();
    })

    afterAll(async () => {
        await cleanDataBase(); 
    })

    const baseUrl='/api/auth/login';

    it.each([
        {
            desc:'the login was successful ',
            data:{email:'onlyuser@gmail.com',password:'PasswordxD'},
            expectedError:'Valid email required',
            expectedStatus:200
        }
    ])(`Shoul work if $desc`, async ({data,expectedError,expectedStatus}) => {
        const response= await api
            .post(baseUrl)
            .send(data)
        expect(response.status).toBe(expectedStatus)
        expect(response.body).toMatchObject({
            success:true,
            message:expect.any(String),
            token:expect.any(String)

        })
    })
})

describe('Post /api/auth/login - Login Error ',()=>{
    beforeAll(async()=>{
      await seedUserTestData();
    })

    afterAll(async () => {
        await cleanDataBase(); 
    })

    const baseUrl='/api/auth/login';

    it.each([
        {
            desc:'the password are invalid',
            data:{email:'onlyuser@gmail.com',password:'waos'},
            expectedError:'Invalid Credentials',
            expectedStatus:401
        },
        {
            desc:'the email are invalid',
            data:{email:'tupapi@gmail.com',password:'PasswordxD'},
            expectedError:'Invalid Credentials',
            expectedStatus:401
        }
    ])(`Shoul fail if $desc`, async ({data,expectedError,expectedStatus}) => {
        const response= await api
            .post(baseUrl)
            .send(data)
        expect(response.status).toBe(expectedStatus)
        expect(response.body).toMatchObject({error:expectedError})
    })
})
