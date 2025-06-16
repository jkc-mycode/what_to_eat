import { Request, Response } from 'express';
import { PostService } from '../services/post.service';
import { CreatePostDto, UpdatePostDto, GetPostsQuery, VoteDto } from '../types/post.types';
import { AuthenticatedRequest } from '../types/auth.types';

export class PostController {
  constructor(private postService: PostService) {}

  // 게시물 생성 (투표 포함 가능)
  createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const dto: CreatePostDto = req.body;

      const post = await this.postService.createPost(userId, dto);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: '게시물 생성 중 오류가 발생했습니다.' });
    }
  };

  // 게시물 목록 조회
  getPosts = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.postService.getPosts(page, limit);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: '게시물 목록 조회 중 오류가 발생했습니다.' });
    }
  };

  // 게시물 상세 조회
  getPost = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as AuthenticatedRequest).user?.id || null;

      const post = await this.postService.getPost(id, userId);
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: '게시물 조회 중 오류가 발생했습니다.' });
    }
  };

  // 게시물 수정
  updatePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const dto: UpdatePostDto = req.body;

      const post = await this.postService.updatePost(id, userId, dto);
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: '게시물 수정 중 오류가 발생했습니다.' });
    }
  };

  // 게시물 삭제
  deletePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await this.postService.deletePost(id, userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: '게시물 삭제 중 오류가 발생했습니다.' });
    }
  };

  // 투표하기
  vote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const dto: VoteDto = req.body;

      const post = await this.postService.vote(id, userId, dto);
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: '투표 중 오류가 발생했습니다.' });
    }
  };

  cancelVote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const dto: VoteDto = req.body;

      const post = await this.postService.cancelVote(id, userId, dto);
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: '투표 취소 중 오류가 발생했습니다.' });
    }
  };
}
