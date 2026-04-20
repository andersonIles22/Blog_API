const supertest=require('supertest');
const app=require('../../src/app');
const {cleanDataBase,seedUsersPostsCategoriesTestData,updatePublishedPostTestData}=require('../helpers/database.setup');

const api=supertest(app);

describe('GET /api/posts/', ()=>{
    beforeAll( async ()=>{
       const insertData= await seedUsersPostsCategoriesTestData();
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
        expectValidResponse(response)
            expect(response.body.data.length).toBeLessThanOrEqual(5)
            expect(response.body.pagination.pageSize).toBe(5)
            expect(response.body.pagination.currentPage).toBe(1);
    })

    test('It should fail if with 400 for a page that not exists',async () => {
        const response=await getPosts({page:9999,limit:5})
            expect(response.status).toBe(400)
            expect(response.body).toMatchObject({
                success:false,
                error:expect.any(String)
            })
    })
});

describe('GET /api/posts/:id', ()=>{
    let existingPostId
    beforeAll(async()=>{
       existingPostId=await seedUsersPostsCategoriesTestData();
    })

    afterAll( async () => {
        await cleanDataBase();
    })
    const baseURL='/api/posts/'
    test('It should work with 200 if the id is valid and data has the correct structure',async () => {
        const response= await api
            .get(`${baseURL}${existingPostId[0]}`)
        expect(response.status).toBe(200)
        expect(response.body.post).toMatchObject({
                id: expect.any(Number),
                title: expect.any(String),
                content: expect.any(String)
        })
    })

    test('It should fail with 404 if the id is invalid',async () => {
        const response=await api
            .get(`${baseURL}4335`)
        expect(response.status).toBe(404)
    })

    test('It should fail with 400 if the is is not an integer positive',async()=>{
        const response= await api
            .get(`${baseURL}is_not_integer`)
        expect(response.status).toBe(400)
        expect(response.body.errors).toContainEqual({ field: 'post_id', message: 'Id should be a Integer Positive' })
    })
})

describe('GET /api/posts/ - Filters',() => {
    let existingPostId
    beforeAll(async()=>{
       existingPostId=await seedUsersPostsCategoriesTestData();
        await updatePublishedPostTestData();
    })

    afterAll( async () => {
        await cleanDataBase();
    })

    const baseUrl='/api/posts';
        //Función GET a la ruta base
    const getPosts=(query={})=>{
        return api.get(baseUrl).query(query);
    }
    test('Filter by Author, should be 200 and return data',async ()=>{
        const response=await getPosts({author_id:1})
        expect(response.status).toBe(200)
        expect(response.body.data).toContainEqual({
            id:expect.any(Number),
            title:expect.any(String),
            content:expect.any(String),
            author:expect.any(Object),
            category_ids:expect.any(Array)
        })
    })
    
    test('Filter by Author_id without posts, should be 200 and return empty data', async () => {
        const response=await getPosts({author_id:5})
        expect(response.status).toBe(200)
        expect(response.body.data).toEqual([])
    })
    
    test('Filter by published, should be 200 and return 4 posts if published=false',async ()=>{
        const response=await getPosts({page:1,limit:5,published:false})
        expect(response.status).toBe(200)
        expect(response.body.data.length).toBe(4)
    })

    test('Filter by published, should be 200 and return 1 posts if published=true',async ()=>{
        const response=await getPosts({page:1,limit:5,published:true})
        expect(response.status).toBe(200)
        expect(response.body.data.length).toBe(1)
    })
    test('Filter by category, should be 200 and 4 posts if category=personal life',async () => {
        const response=await getPosts({category:'work'})
        expect(response.status).toBe(200)
        expect(response.body.data.length).toBe(1)
        expect(response.body.data).toContainEqual({
            id:expect.any(Number),
            title:expect.any(String),
            content:expect.any(String),
            author:expect.any(Object),
            category_ids:expect.any(Array)
        })
    })

    test('Filter by category and published, should be 200 and get 1 post succesfully', async () => {
        const response= await getPosts({category:'personal life',published:false})
        expect(response.status).toBe(200)
        expect(response.body.data.length).toBe(1)
    })
})