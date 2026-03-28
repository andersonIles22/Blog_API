const supertest=require('supertest');
const app=require('../../src/app');
const {seedUserPostCommentTestData,cleanDataBase}=require('../helpers/database.setup');

const api=supertest(app);

const getComments=(post_id,queries={})=>{
    return api.get(`/api/posts/${post_id}/comments`).query(queries);
}

describe('GET /api/posts/:id/comments - posts_id Validation', ()=>{
    
    beforeAll(async () => {
        await cleanDataBase();
        await seedUserPostCommentTestData();
    })
    afterAll(async () => {
        await cleanDataBase();
    })
    
    it('Should fail with 404 if post does not exist',async () => {
        const response= await getComments(4)
        expect(response.status).toBe(404)
        expect(response.body).toMatchObject({success: false, error: 'The Post does not exist'})
    })
})

describe('GET /api/posts/:id/comments - queries Validation',() => {
    beforeAll(async () => {
        await cleanDataBase();
        await seedUserPostCommentTestData();
    })
    afterAll(async () => {
        await cleanDataBase();
    })

    it('Should return an empty Array in the data with 200 if page value does not exist', async () => {
        const response= await getComments(2,{page:99999,limit:5})
        expect(response.status).toBe(200)
        expect(response.body.data).toEqual([])
    })
    
    it('Should fail with 400 if limit value is invalid',async () => {
        const response=await getComments(2,{page:1,limit:55})
        expect(response.status).toBe(400)
        expect(response.body).toEqual(expect.objectContaining(
            {
                success:false,
                errors:expect.any(Array)
            }
        ))
    })
})

describe ('GET /api/posts/:id/comments - Get comments successfully',()=>{
    beforeAll(async () => {
        await cleanDataBase();
        await seedUserPostCommentTestData();
    })
    afterAll(async () => {
        await cleanDataBase();
    })

    it('Should work with 200 if post have comments exist',async () => {
        const response=await getComments(1)
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            success:true,
            data:expect.any(Object)
        })
    })

    it('Should work with 200 even if post has no comments',async () => {
        const response=await getComments(2)
        expect(response.status).toBe(200)
        expect(response.body).toMatchObject({
            success:true,
            data:expect.any(Array)
        })
    })
})