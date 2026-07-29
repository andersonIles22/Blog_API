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
    ];

    beforeEach(()=>{
        jest.clearAllMocks();
        userRepository.checkAuthor.mockResolvedValue(true)
        postRepository.countPosts.mockResolvedValue(2)
        postRepository.getById.mockResolvedValue(mockPosts[0])
        postRepository.getAll.mockResolvedValue(mockPosts)
    })

    describe('Pass Test Succesfully',()=>{
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
    
    describe('Should Fail test',()=>{

        const mockPost_ErrorAuthor={
            message:"Post Author not found",
            statusCode:404
        };

        const mockPost_ErrorPost={
            message:"The Post does not exist",
            statusCode:404
        }
        beforeEach(()=>{
            userRepository.checkAuthor.mockResolvedValue(false);
            postRepository.getById.mockResolvedValue(undefined)
        })
        const postId=1
        const params={
            page:1,
            limit:3,
            author_id:1,
            published:true
        };
        it('with 404 if not exist author for findAllPost Service',async () => {
            await expect(postsService.findAllPosts(params))
                .rejects
                .toMatchObject(mockPost_ErrorAuthor)
            expect(userRepository.checkAuthor).toHaveBeenCalledTimes(1)
        })

        it(' with 404 if not exist post for findById Service',async () => {
            await expect(postsService.findById(postId))
                .rejects
                .toMatchObject(mockPost_ErrorPost)
            expect(postRepository.getById).toHaveBeenCalledTimes(1)
        })
    })
    
})

describe('UPDATE api/posts/:post_id',() => {
    const mockPost={
        author_id:1,
        content:"El titulo es la frase que pensaba que lo dijo Justin Beiber",
        id:1,
        published:true,
        title:"Nunca digas nunca"
    };
    const mockPostResult={
        author_id:1,
        content:"Como es la wea muchachos",
        id:1,
        published:true,
        title:"Ahora si muchachos, o no?"
    }
    beforeEach(()=>{
        jest.clearAllMocks();
        postRepository.getById.mockResolvedValue(mockPost)
        postRepository.update.mockResolvedValue(mockPostResult)
    })

    const params={
        post_id:1,
        title:"Ahora si muchachos, oh no",
        content:"Como es la wea muchachos"
    }
    describe('Test pass successfuly',()=>{
        it('update resource by id',async ()=>{
        const result= await postsService.updateResource(params)
        expect(result).toEqual(mockPostResult)
        expect(postRepository.update).toHaveBeenCalledTimes(1)
    });

    describe('Should fail ',()=>{
        const mockPost_ErrorPost={
            message:"The Post does not exist",
            statusCode:404
        }
        beforeEach(()=>{
            postRepository.getById.mockResolvedValue(undefined)
        })
        const params={
            post_id:1,
            title:"Ahora si muchachos, oh no",
            content:"Como es la wea muchachos"
        }
        it('with 404 if post does not exist',async () => {
            await expect(postsService.updateResource(params))
                .rejects
                .toMatchObject(mockPost_ErrorPost)

        })
    })
    })
})

describe("DELETE api/posts/:post_id",()=>{
    const mockPost={
        author_id:1,
        content:"El titulo es la frase que pensaba que lo dijo Justin Beiber",
        id:1,
        published:true,
        title:"Nunca digas nunca"
    };
    const mockResult={
        id:1,
        title:"Nunca digas nunca"
    };

    beforeEach(()=>{
        jest.clearAllMocks();
        postRepository.getById.mockResolvedValue(mockPost);
        postRepository.deletePost.mockResolvedValue(mockResult)
    })

    describe('Test Pass successfully',()=>{
        const postId=1;

        it("delete resource by id ",async () => {
            const result= await postsService.deleteResource(postId);
            expect(result).toEqual(mockResult)
            expect(postRepository.deletePost).toHaveBeenCalledTimes(1)
        })
    })
    
    describe('Should Fail',()=>{

        beforeEach(()=>{
            postRepository.getById.mockResolvedValue(undefined)
        })
        const postId=1;
        const mockPost_ErrorPost={
            message:"The Post does not exist",
            statusCode:404
        }
        it('with 404 if post does not exist',async () => {
            await expect(postsService.deleteResource(postId))
                .rejects
                .toMatchObject(mockPost_ErrorPost)
        })
    })
})