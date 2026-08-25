
jest.mock('../../src/repositories/commentsRepository');
jest.mock('../../src/repositories/postsRepository');
const commentsRepository=require('../../src/repositories/commentsRepository');
const postsRepository=require('../../src/repositories/postsRepository');

const commentsService=require('../../src/services/commentsService');

describe(' GET /api/posts/:id/comments',()=>{
    const mockAllComments=[
        {
            id:1,
            post_id:3,
            author_id:1,
            content:"No digas eso papu :C"
        },
        {
            id:2,
            post_id:3,
            author_id:3,
            content:"Eso no pasaba cuando existia un admin"
        },
        {
            id:3,
            post_id:3,
            author_id:5,
            content:"Cuenta en decandencia"
        }
    ]
    const mockCountComments=mockAllComments.length;

    beforeEach(()=>{
        jest.clearAllMocks();
        postsRepository.exists.mockResolvedValue(true)
        commentsRepository.getAll.mockResolvedValue(mockAllComments);
        commentsRepository.countComments.mockResolvedValue(mockCountComments);
    })

    describe('Test pass successfully',()=>{
        const params={
            postExist:{
                post_id:3,
                page:1,
                limit:3
            },
            postNotExist:{
                post_id:2,
                page:1,
                limit:3
            }
        }
        
        it('Get all commments by Id',async () => {
            const result=await commentsService.getAll(params.postExist)
            expect(result.data).toEqual(mockAllComments)
            expect(commentsRepository.getAll).toHaveBeenCalledTimes(1)
        })
        
        
        it('Get a result even when the post has no comments', async () => {
            const mockAllCommentsEmpty=[];
            
            postsRepository.exists.mockResolvedValue(true)
            commentsRepository.getAll.mockResolvedValue(mockAllCommentsEmpty);
            commentsRepository.countComments.mockResolvedValue(0);

            const result=await commentsService.getAll(params.postNotExist)
            expect(result.data).toEqual(mockAllCommentsEmpty)
            expect(commentsRepository.getAll).toHaveBeenCalledTimes(1)
        })
    })
})
describe('POST /api/posts/:id/comments', ()=>{

    const mockCommentResult={
        id:1,
        post_id:1,
        author_id:1,
        content:"Digamen que es una broma sobre la noticia de mi idolo :c"
    }
    beforeEach(() => {
        jest.clearAllMocks();
        postsRepository.exists.mockResolvedValue(true);
        commentsRepository.create.mockResolvedValue(mockCommentResult);
    })
    
    describe('Test pass successfully',()=>{
        const commentData={
            post_id:1,
            author_comment_id:2,
            post_comment:1
        }
        it('Create a comment on posts',async () => {
            const result=await commentsService.create(commentData)
            expect(result).toMatchObject(mockCommentResult)
            expect(commentsRepository.create).toHaveBeenCalledTimes(1)
        })
    })
     
    describe('Fail test',()=>{
        const mockPost_ErrorAuthor={
            message:"The Post does not exist",
            statusCode:404 
        };

        beforeEach(()=>{
            postsRepository.exists.mockResolvedValue(false);
        })
        const params={
            post_id:3,
            author_comment_id:2,
            post_comment:1
        }
        it('with 404 if the posts does not exist',async () => {
            await expect(commentsService.create(params))
                .rejects
                .toMatchObject(mockPost_ErrorAuthor)
            expect(postsRepository.exists).toHaveBeenCalledTimes(1)
        })
    })
})