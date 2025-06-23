import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { PostService } from '../services/post.service';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();
const postController = new PostController(new PostService());

// 게시물 목록 조회
router.get('/', postController.getPosts);

// 게시물 단일 조회
router.get('/:id', postController.getPost);

// 게시물 생성 (인증 필요)
router.post('/', authenticateJWT, postController.createPost as any);

// 게시물 수정 (인증 필요)
router.patch('/:id', authenticateJWT, postController.updatePost as any);

// 게시물 삭제 (인증 필요)
router.delete('/:id', authenticateJWT, postController.deletePost as any);

// 투표하기 (인증 필요)
router.post('/:id/vote', authenticateJWT, postController.vote as any);

// 투표 취소 (인증 필요)
router.delete('/:id/vote', authenticateJWT, postController.cancelVote as any);

// 내가 투표한 게시물 목록 조회 (인증 필요)
router.get('/voted', authenticateJWT, postController.getVotedPosts as any);

export default router;
