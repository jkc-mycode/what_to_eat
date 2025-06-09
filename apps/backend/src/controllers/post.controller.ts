import { Request, Response, NextFunction } from 'express';
import { PostService } from '../services/post.service';
import { CreatePostDto, UpdatePostDto, GetPostsQuery } from '../types/post.types';
import { AuthenticatedRequest, ApiResponse, ErrorResponseDTO } from '../types/auth.types';

export class PostController {
  constructor(private postService: PostService) {}

  // 게시물 생성
  createPost = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { title, content }: CreatePostDto = req.body;
      const authorId = req.user.id;

      // 입력값 검증
      if (!title || !content) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '제목과 내용을 입력해주세요.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (title.length > 200) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '제목은 200자를 초과할 수 없습니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      const post = await this.postService.createPost(authorId, { title, content });

      const successResponse: ApiResponse = {
        success: true,
        message: '게시물이 생성되었습니다.',
        data: { post },
      };

      res.status(201).json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        res.status(400).json(errorResponse);
        return;
      }
      next(error);
    }
  };

  // 게시물 목록 조회
  getPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, search }: GetPostsQuery = req.query;

      const pageNum = page ? parseInt(String(page), 10) : 1;
      const limitNum = limit ? parseInt(String(limit), 10) : 10;

      // 페이지네이션 검증
      if (pageNum < 1) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '페이지 번호는 1 이상이어야 합니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (limitNum < 1 || limitNum > 100) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: 'limit은 1 이상 100 이하여야 합니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      const result = await this.postService.getPosts({
        page: pageNum,
        limit: limitNum,
        search: typeof search === 'string' ? search : undefined,
      });

      const successResponse: ApiResponse = {
        success: true,
        data: result,
      };

      res.json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        res.status(500).json(errorResponse);
        return;
      }
      next(error);
    }
  };

  // 게시물 단일 조회
  getPost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '게시물 ID가 필요합니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      const post = await this.postService.getPostById(id);

      const successResponse: ApiResponse = {
        success: true,
        data: { post },
      };

      res.json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        const statusCode = error.message === '게시물을 찾을 수 없습니다.' ? 404 : 500;
        res.status(statusCode).json(errorResponse);
        return;
      }
      next(error);
    }
  };

  // 게시물 수정
  updatePost = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, content }: UpdatePostDto = req.body;
      const authorId = req.user.id;

      if (!id) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '게시물 ID가 필요합니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 수정할 내용이 없는 경우
      if (!title && !content) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '수정할 내용을 입력해주세요.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 제목 길이 검증
      if (title && title.length > 200) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '제목은 200자를 초과할 수 없습니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      const updatedPost = await this.postService.updatePost(id, authorId, { title, content });

      const successResponse: ApiResponse = {
        success: true,
        message: '게시물이 수정되었습니다.',
        data: { post: updatedPost },
      };

      res.json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        let statusCode = 500;
        if (error.message === '게시물을 찾을 수 없습니다.') {
          statusCode = 404;
        } else if (error.message === '게시물을 수정할 권한이 없습니다.') {
          statusCode = 403;
        }
        res.status(statusCode).json(errorResponse);
        return;
      }
      next(error);
    }
  };

  // 게시물 삭제
  deletePost = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const authorId = req.user.id;

      if (!id) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '게시물 ID가 필요합니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      await this.postService.deletePost(id, authorId);

      const successResponse: ApiResponse = {
        success: true,
        message: '게시물이 삭제되었습니다.',
      };

      res.json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        let statusCode = 500;
        if (error.message === '게시물을 찾을 수 없습니다.') {
          statusCode = 404;
        } else if (error.message === '게시물을 삭제할 권한이 없습니다.') {
          statusCode = 403;
        }
        res.status(statusCode).json(errorResponse);
        return;
      }
      next(error);
    }
  };
}
