import { Router } from 'express';
import { PostController } from '../controllers/post.controller';
import { PostService } from '../services/post.service';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();
const postController = new PostController(new PostService());

// 게시물 목록 조회 (인증 불필요)
router.get('/', postController.getPosts);

// 게시물 단일 조회 (인증 불필요)
router.get('/:id', postController.getPost);

// 게시물 생성 (인증 필요)
router.post('/', authenticateJWT, postController.createPost as any);

// 게시물 수정 (인증 필요)
router.patch('/:id', authenticateJWT, postController.updatePost as any);

// 게시물 삭제 (인증 필요)
router.delete('/:id', authenticateJWT, postController.deletePost as any);

export default router;
