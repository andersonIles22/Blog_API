const supertest=require('supertest');
const app=require('../../src/app');
const { seedUserPostCommentTestData, cleanDataBase } = require('../helpers/database.setup');
const{generateToken}=require('../helpers/auth.test.helper');

const api=supertest(app);


const postComment=(post_id)=>{
    return api.post(`/api/posts/${post_id}/comments`)
};

describe('POST /api/posts/:id/comments/ Input Validations', ()=>{
    let user
    let token
    
    beforeAll(async () => {
        user=await seedUserPostCommentTestData();
        token=generateToken(user)
    })
    afterAll(async () => {
        await cleanDataBase();
    })
    
    it.each([
        {
            desc:"the field post_comment is empty",
            data:'',
            expectedError:'Comment is required',
            expectedStatus:400
        },
        {
            desc:"the post_comment is too short",
            data:'nop',
            expectedError:'Comment should be between 3 to 500 characters',
            expectedStatus:400            
        },
        {
            desc:"the post_comment is too long",
            data:`DPZNWALPCDpmfrWtJCWngQvxHZAHfVfkDKccFXHTHgLooSiNwNHhfCvDXern
                    nRgISqfksnsPnXBoWFTYtfteCwTjQBPUwXpIAvrTVTmrjPWUkqZarGHsQqVf
                    rBpdNmLksrquMUjMzaCdmrYLYxcLUMIAsDxfNqeDKVYxlAXEqQuJcnbVuiXD
                    luQEsPxddIcOmNKvQlTWTVacYrXHdGwTvOgPXQZGHVGmUBXuavGJsqEjiZKX
                    eXElTmxBhqDVCHDRXkrKDJquYPvZtcDuLuefpHdRGExCfjLPcpsXzCbUAjEk
                    cgnGrukpnSSVKJwSuuwHYwzDdnXbxrlEwLVdAqzTatCvtaroWBzRaAtnMmsS
                    PmVvfiUOYJnKmotLWRcOgkuojpjNLxjPChYKDwGVDPQOBKQaeIFVoAxjYviL
                    ceZxQNSzfQxiYgFQQIaAZZnDDHxKOqwSQUOIibsKZJHLnuQkxlZXjduRcTSY
                    kArQHmAIJiLYdPuNsnPTfBJmxrFWOJrhHoRyMiySiZfGQPfkHuXLVaScmLgc
                    OdFbpGUEltTKlRbsAeFyweIEFeydMHHeUAgWfLHWnxStfLLohTtoBLHJSrah
                `,
            expectedError:'Comment should be between 3 to 500 characters',
            expectedStatus:400
        }
    ])('Should fail with 400 if $desc',async ({data, expectedError,expectedStatus}) => {
        const response= await postComment(1)
            .send({post_comment:data})
            .set({'Authorization':`Bearer ${token}`})
        expect(response.status).toBe(expectedStatus)
        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({ message:expectedError})
            ])) 
    })
})

describe('POST /api/posts/:id/comments - posts_id Validation', ()=>{
    let user
    let token
    
    beforeAll(async () => {
        user=await seedUserPostCommentTestData();
        token=generateToken(user)
    })
    afterAll(async () => {
        await cleanDataBase();
    })
    
    it('Should fail with 404 if post does not exist',async () => {
        const response= await postComment(4)
            .send({post_comment:'Entonces no te conviertes en un usuario de fuego?'})
            .set({'Authorization':`Bearer ${token}`})
        expect(response.status).toBe(404)
        expect(response.body).toMatchObject({success: false, error: 'The Post does not exist'})
    })
})

describe('POST /api/posts/:id/comments - Comment created successfully',()=>{
    let user
    let token
    
    beforeAll(async () => {
        user=await seedUserPostCommentTestData();
        token=generateToken(user)
    })
    afterAll(async () => {
        await cleanDataBase();
    })

    it('Should work with 201 if a comment is created',async () => {
        const response=await postComment(1)
            .send({post_comment:'Como ven a ese pendejo xdxdxd'})
            .set({'Authorization':`Bearer ${token}`})
            expect(response.status).toBe(201)
            expect(response.body).toEqual({ success: true, message: 'Comentario creado' })
    })
})



