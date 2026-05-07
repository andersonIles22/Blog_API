const postsService=require('../../src/services/postsService');
const postRepository=require('../../src/repositories/postsRepository');
const userRepository=require('../../src/repositories/userRepository');
const { param } = require('../../src/app');

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

    const mockCondition=`p.author_id=$1 AND p.published=$2`
    const mockValues=[1,true]
    beforeEach(() => { 
        jest.clearAllMocks();   
        userRepository.checkAuthor.mockResolvedValue(true)
        postRepository.getAll.mockResolvedValue(mockPosts)
        postRepository.countPosts(mockCondition,mockValues)
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