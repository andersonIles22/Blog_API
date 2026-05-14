const postsService=require('../../src/services/postsService');
const postRepository=require('../../src/repositories/postsRepository');
const userRepository=require('../../src/repositories/userRepository');

jest.mock('../../src/repositories/userRepository')
jest.mock('../../src/repositories/postsRepository');


describe('GET api/posts - Get all Posts',()=>{
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
        userRepository.checkAuthor.mockResolvedValue(true)
        postRepository.countPosts.mockResolvedValue(2)
        postRepository.getAll.mockResolvedValue(mockPosts)
    });

    const params={
        page:1,
        limit:3,
        author_id:1,
        published:true
    }

    it('Get all post by author and published succesfully',async () => {
        const result =await postsService.findAllPosts(params);
        expect(result.data).toEqual(mockPosts)
        expect(postRepository.getAll).toHaveBeenCalledTimes(1)
    })
    
    it("Should fail if author does not exist", async () => {
        userRepository.checkAuthor.mockResolvedValue(false)
        await expect(postsService.findAllPosts(params))
            .rejects
            .toThrow('Post Author not found')
    })
})

describe('GET api/posts/id: - Get post by id',()=>{
    const mockFailMessage='The Post does not exist'
    beforeEach(()=>{
        jest.clearAllMocks();
        postRepository.getById.mockResolvedValue(null)
    })
    
    const resource_id=44
    it('it should fail if the post id is invalid ', async () => {
        await expect(postsService.findById(resource_id)) 
            .rejects
            .toThrow(mockFailMessage)
    })
})