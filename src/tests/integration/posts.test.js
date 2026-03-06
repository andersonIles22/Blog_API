const supertest=require('supertest');
const app=require('../../app');
const {cleanDataBase,seedTestData}=require('../helpers/database.setup');
const { response } = require('express');

const api=supertest(app);

describe('GET /api/post/', ()=>{
    beforeAll( async ()=>{
        await seedTestData();
    });
    afterAll(async ()=>{
        await cleanDataBase();
    });

    test('Return all data of posts', async ()=>{
        const response=await api.get('/api/posts')
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('data')
            expect(Array.isArray(response.body.data)).toBe(true);            
    });

    test('The limit parameter and query page work',async()=>{
        const response=await api.get('/api/posts').query({page:1,limit:5})
            expect(response.status).toBe(200)
            expect(response.body.data.length).toBeLessThanOrEqual(5)
            expect(response.body.pagination.pageSize).toBe(5)
            expect(response.body.pagination.currentPage).toBe(1)
    })

    test('Return an empty array and status 200 for a page that not exists',async () => {
        const response=await api.get('/api/posts').query({page:9999,limit:5})
            expect(response.status).toBe(200)
            expect(response.body.data).toEqual([])
            expect(response.body).toHaveProperty('pagination')
            expect(parseInt(response.body.pagination.totalPosts)).toBeGreaterThanOrEqual(0)
    })
});
