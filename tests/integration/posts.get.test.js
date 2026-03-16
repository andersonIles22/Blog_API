const supertest=require('supertest');
const app=require('../../src/app');
const {cleanDataBase,seedUsersTestData}=require('../helpers/database.setup');

const api=supertest(app);

describe('GET /api/post/', ()=>{
    beforeAll( async ()=>{
       const insertData= await seedUsersTestData();
        console.log(insertData)
    });
    afterAll(async ()=>{
        await cleanDataBase();
    });

    const baseUrl='/api/posts';
        //Función GET a la ruta base
    const getPosts=(query={})=>{
        return api.get(baseUrl).query(query);
    }
        // Función para validaciones basicas esperadas
    const expectValidResponse=(response)=>{
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('data')
        expect(Array.isArray(response.body.data)).toBe(true)
    }

    test('Return all data of posts', async ()=>{
        const response=await getPosts();
        expectValidResponse(response);            
    });
    
    test('The limit parameter and query page work',async()=>{
        const response=await getPosts({page:1,limit:5})
        console.log(response.body.data)
        expectValidResponse(response)
            expect(response.body.data.length).toBeLessThanOrEqual(5)
            expect(response.body.pagination.pageSize).toBe(5)
            expect(response.body.pagination.currentPage).toBe(1);
    })

    test('Return an empty array and status 200 for a page that not exists',async () => {
        const response=await getPosts({page:9999,limit:5})
        expectValidResponse(response)
            expect(response.body.data).toEqual([])
            expect(response.body).toHaveProperty('pagination')
            expect(parseInt(response.body.pagination.totalPosts)).toBeGreaterThanOrEqual(0)
    })
});
