jest.resetModules()
jest.mock('../../src/repositories/userRepository');
jest.mock('../../src/repositories/postsRepository');

const postsService=require('../../src/services/postsService')
const postRepository=require('../../src/repositories/postsRepository');
const userRepository=require('../../src/repositories/userRepository');


describe('GET api/posts',()=>{

    const mockPost={
        author_id:1,
        content:"El titulo es la frase que pensaba que lo dijo Justin Beiber",
        id:1,
        published:true,
        title:"Nunca digas nunca"
    }

    beforeEach(()=>{
        jest.clearAllMocks();
        postRepository.getById.mockResolvedValue(mockPost)
    })
    
    
    const postId=1
    
    it('Get a post by Id',async () => {  
        const result = await postsService.findById('1');
        expect(result).toEqual(mockPost)
        expect(postRepository.getById).toHaveBeenCalledTimes(1)
    })
})