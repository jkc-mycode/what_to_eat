import { Request, Response } from 'express';
import { PostService } from '../services/post.service';
import { CreatePostDto, UpdatePostDto, GetPostsQuery, VoteDto } from '../types/post.types';
import { AuthenticatedRequest } from '../types/auth.types';
import HttpException from '../utils/error-exception.util';

export class PostController {
  constructor(private postService: PostService) {}

  // 게시물 생성 (투표 포함 가능)
  createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const dto: CreatePostDto = req.body;

      const post = await this.postService.createPost(userId, dto);
      res
        .status(201)
        .json({ success: true, message: '게시물이 성공적으로 생성되었습니다.', data: post });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: '게시물 생성 중 오류가 발생했습니다.' });
      }
    }
  };

  // 게시물 목록 조회
  getPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;

      const result = await this.postService.getPosts(page, limit, search);
      res.json({ success: true, data: result });
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, message: '게시물 목록 조회 중 오류가 발생했습니다.' });
    }
  };

  // 게시물 상세 조회
  getPost = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).user?.id || null;

      const post = await this.postService.getPost(id, userId);
      res.json({ success: true, data: post });
    } catch (error) {
      res.status(500).json({ success: false, message: '게시물 조회 중 오류가 발생했습니다.' });
    }
  };

  // 게시물 수정
  updatePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const dto: UpdatePostDto = req.body;

      await this.postService.updatePost(id, userId, dto);
      res.json({ success: true, message: '게시물이 성공적으로 수정되었습니다.' });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: '게시물 수정 중 오류가 발생했습니다.' });
      }
    }
  };

  // 게시물 삭제
  deletePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await this.postService.deletePost(id, userId);
      res.json({ success: true, message: '게시물이 성공적으로 삭제되었습니다.' });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: '게시물 삭제 중 오류가 발생했습니다.' });
      }
    }
  };

  // 투표하기
  vote = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const postId = req.params.id;
      const userId = req.user!.id;
      const dto = req.body as VoteDto;

      await this.postService.vote(postId, userId, dto);
      res.json({ success: true, message: '투표가 정상적으로 처리되었습니다.' });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: '투표 중 오류가 발생했습니다.' });
      }
    }
  };

  cancelVote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const dto: VoteDto = req.body;

      await this.postService.cancelVote(id, userId, dto);
      res.json({ success: true, message: '투표가 정상적으로 취소되었습니다.' });
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: '투표 취소 중 오류가 발생했습니다.' });
      }
    }
  };

  getVotedPosts = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const result = await this.postService.getVotedPosts(userId);
    res.json({ success: true, data: result });
  };
}
