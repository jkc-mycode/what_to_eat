import { Request, Response, NextFunction } from 'express';
import { PollService } from '../services/poll.service';
import { CreatePollDto, UpdatePollDto, VoteDto } from '../types/poll.types';
import { AuthenticatedRequest, ApiResponse, ErrorResponseDTO } from '../types/auth.types';

export class PollController {
  constructor(private pollService: PollService) {}

  // 투표 생성
  createPoll = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { postId } = req.params;
      const { title, description, options, expiresAt }: CreatePollDto = req.body;

      // 입력값 검증
      if (!title || !options) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '투표 제목과 선택지를 입력해주세요.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (!Array.isArray(options) || options.length < 2) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '투표는 최소 2개 이상의 선택지가 필요합니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (options.length > 10) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '투표 선택지는 최대 10개까지 가능합니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 빈 선택지 검증
      if (options.some((option) => !option || option.trim() === '')) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '모든 선택지를 입력해주세요.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      const poll = await this.pollService.createPoll(postId, {
        title,
        description,
        options: options.map((option) => option.trim()),
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });

      const successResponse: ApiResponse = {
        success: true,
        message: '투표가 생성되었습니다.',
        data: { poll },
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

  // 투표 조회
  getPoll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id; // 로그인한 사용자면 userId 포함

      if (!id) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '투표 ID가 필요합니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      const poll = await this.pollService.getPollById(id, userId);

      const successResponse: ApiResponse = {
        success: true,
        data: { poll },
      };

      res.json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        const statusCode = error.message === '투표를 찾을 수 없습니다.' ? 404 : 500;
        res.status(statusCode).json(errorResponse);
        return;
      }
      next(error);
    }
  };

  // 게시물의 투표 조회
  getPollByPostId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { postId } = req.params;
      const userId = (req as any).user?.id;

      if (!postId) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '게시물 ID가 필요합니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      const poll = await this.pollService.getPollByPostId(postId, userId);

      const successResponse: ApiResponse = {
        success: true,
        data: { poll },
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

  // 투표 수정
  updatePoll = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, isActive, expiresAt }: UpdatePollDto = req.body;
      const authorId = req.user.id;

      if (!id) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '투표 ID가 필요합니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      // 수정할 내용이 없는 경우
      if (
        title === undefined &&
        description === undefined &&
        isActive === undefined &&
        expiresAt === undefined
      ) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '수정할 내용을 입력해주세요.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      const updateData: UpdatePollDto = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;

      const updatedPoll = await this.pollService.updatePoll(id, authorId, updateData);

      const successResponse: ApiResponse = {
        success: true,
        message: '투표가 수정되었습니다.',
        data: { poll: updatedPoll },
      };

      res.json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        const statusCode = error.message.includes('권한이 없습니다')
          ? 403
          : error.message === '투표를 찾을 수 없습니다.'
            ? 404
            : 500;
        res.status(statusCode).json(errorResponse);
        return;
      }
      next(error);
    }
  };

  // 투표 삭제
  deletePoll = async (
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
          message: '투표 ID가 필요합니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      await this.pollService.deletePoll(id, authorId);

      const successResponse: ApiResponse = {
        success: true,
        message: '투표가 삭제되었습니다.',
      };

      res.json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        const statusCode = error.message.includes('권한이 없습니다')
          ? 403
          : error.message === '투표를 찾을 수 없습니다.'
            ? 404
            : 500;
        res.status(statusCode).json(errorResponse);
        return;
      }
      next(error);
    }
  };

  // 투표하기
  vote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { optionId }: VoteDto = req.body;
      const userId = req.user.id;

      if (!id) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '투표 ID가 필요합니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      if (!optionId) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '선택지를 선택해주세요.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      const vote = await this.pollService.vote(id, userId, { optionId });

      const successResponse: ApiResponse = {
        success: true,
        message: '투표가 완료되었습니다.',
        data: { vote },
      };

      res.json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        const statusCode = error.message === '투표를 찾을 수 없습니다.' ? 404 : 400;
        res.status(statusCode).json(errorResponse);
        return;
      }
      next(error);
    }
  };

  // 투표 취소
  cancelVote = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      if (!id) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '투표 ID가 필요합니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      await this.pollService.cancelVote(id, userId);

      const successResponse: ApiResponse = {
        success: true,
        message: '투표가 취소되었습니다.',
      };

      res.json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        const statusCode = error.message === '투표 기록을 찾을 수 없습니다.' ? 404 : 500;
        res.status(statusCode).json(errorResponse);
        return;
      }
      next(error);
    }
  };

  // 투표 결과 조회
  getPollResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!id) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: '투표 ID가 필요합니다.',
        };
        res.status(400).json(errorResponse);
        return;
      }

      const results = await this.pollService.getPollResults(id, userId);

      const successResponse: ApiResponse = {
        success: true,
        data: results,
      };

      res.json(successResponse);
    } catch (error) {
      if (error instanceof Error) {
        const errorResponse: ErrorResponseDTO = {
          success: false,
          message: error.message,
        };
        const statusCode = error.message === '투표를 찾을 수 없습니다.' ? 404 : 500;
        res.status(statusCode).json(errorResponse);
        return;
      }
      next(error);
    }
  };
}
