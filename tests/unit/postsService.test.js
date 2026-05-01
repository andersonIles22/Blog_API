const postsService=require('../../src/services/postsService');
const postsRepository=require('../../src/repositories/postsRepository');


jest.mock('../../src/repositories/postsRepository');

describe('GET api/posts - Test One',()=>{
    const mockPosts=[{
        id:1,
        title:'La ballena azul',
        content:'Trata sobre una ballena azul, xd',
        author_id:2,
        published:true
    },
    {
        id:2,
        title:'El sol',
        content:'En millones de años, vamos a morir :o',
        author_id:1,
        published:true

    }]
    beforeEach(() => { 
        jest.clearAllMocks(); 
        postsRepository.getAll.mockResolvedValue(mockPosts)
    });

    const params={
        page:1,
        limit:3,
        autho_id:1,
        published:true
    }

    it('Get all posts',async () => {
        const result =await postsService.findAllPosts(params);
        expect(result.data).toEqual(mockPosts)
        expect(postsRepository.getAll).toHaveBeenCalledTimes(1)
    })
})