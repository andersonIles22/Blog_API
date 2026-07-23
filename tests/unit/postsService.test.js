jest.resetModules()
jest.mock('../../src/repositories/userRepository');
jest.mock('../../src/repositories/postsRepository');

const postsService=require('../../src/services/postsService')
const postRepository=require('../../src/repositories/postsRepository');
const userRepository=require('../../src/repositories/userRepository');


describe('GET api/posts',()=>{

    const mockPosts=[
        {
        author_id:1,
        content:"El titulo es la frase que pensaba que lo dijo Justin Beiber",
        id:1,
        published:true,
        title:"Nunca digas nunca"
        },
        {
        author_id:1,
        content:"Dime que nunca has amado sin, decirmo que nunca has amado",
        id:2,
        published:true,
        title:"Una confesión"
        }
]

    beforeEach(()=>{
        jest.clearAllMocks();
        userRepository.checkAuthor.mockResolvedValue(true)
        postRepository.countPosts.mockResolvedValue(2)
        postRepository.getById.mockResolvedValue(mockPosts[0])
        postRepository.getAll.mockResolvedValue(mockPosts)
    })
    
    
    const postId=1
    const params={
        page:1,
        limit:3,
        author_id:1,
        published:true
    }
    it('Get a post by Id',async () => {  
        const result = await postsService.findById(postId);
        expect(result).toEqual(mockPosts[0])
        expect(postRepository.getById).toHaveBeenCalledTimes(1)
    })
    it('Get All posts sucessfully',async () => {
        const result = await postsService.findAllPosts(params)
        expect(result.data).toEqual(mockPosts)
        expect(postRepository.getAll).toHaveBeenCalledTimes(1)
    })
})