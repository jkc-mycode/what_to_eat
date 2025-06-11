import { Router } from 'express';
import { PollController } from '../controllers/poll.controller';
import { PollService } from '../services/poll.service';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();
const pollController = new PollController(new PollService());

// 게시물의 투표 조회 (인증 불필요 - 로그인한 경우 사용자 투표 정보 포함)
router.get('/post/:postId', pollController.getPollByPostId);

// 투표 단일 조회 (인증 불필요 - 로그인한 경우 사용자 투표 정보 포함)
router.get('/:id', pollController.getPoll);

// 투표 결과 조회 (인증 불필요 - 로그인한 경우 사용자 투표 정보 포함)
router.get('/:id/results', pollController.getPollResults);

// 투표 생성 (인증 필요 - 게시물 작성자만)
router.post('/post/:postId', authenticateJWT, pollController.createPoll as any);

// 투표 수정 (인증 필요 - 게시물 작성자만)
router.patch('/:id', authenticateJWT, pollController.updatePoll as any);

// 투표 삭제 (인증 필요 - 게시물 작성자만)
router.delete('/:id', authenticateJWT, pollController.deletePoll as any);

// 투표하기 (인증 필요)
router.post('/:id/vote', authenticateJWT, pollController.vote as any);

// 투표 취소 (인증 필요)
router.delete('/:id/vote', authenticateJWT, pollController.cancelVote as any);

export default router;
