import { prisma } from '../utils/prisma.util';
import {
  CreatePollDto,
  UpdatePollDto,
  VoteDto,
  PollResponse,
  PollResultsResponse,
  VoteResponse,
  PollOptionResponse,
} from '../types/poll.types';

export class PollService {
  // 투표 생성
  async createPoll(postId: string, data: CreatePollDto): Promise<PollResponse> {
    const { title, description, options, expiresAt } = data;

    // 최소 2개 이상의 옵션 필요
    if (options.length < 2) {
      throw new Error('투표는 최소 2개 이상의 선택지가 필요합니다.');
    }

    // 최대 10개 옵션 제한
    if (options.length > 10) {
      throw new Error('투표 선택지는 최대 10개까지 가능합니다.');
    }

    // 게시물 존재 확인
    const post = await prisma.post.findUnique({
      where: { id: postId, deletedAt: null },
    });

    if (!post) {
      throw new Error('게시물을 찾을 수 없습니다.');
    }

    // 이미 투표가 있는지 확인
    const existingPoll = await prisma.poll.findUnique({
      where: { postId },
    });

    if (existingPoll) {
      throw new Error('이미 투표가 존재하는 게시물입니다.');
    }

    const poll = await prisma.poll.create({
      data: {
        title,
        description,
        postId,
        expiresAt,
        options: {
          create: options.map((text) => ({ text })),
        },
      },
      include: {
        options: true,
        votes: {
          include: {
            option: true,
          },
        },
      },
    });

    return this.formatPollResponse(poll);
  }

  // 투표 조회
  async getPollById(pollId: string, userId?: string): Promise<PollResponse> {
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            votes: true,
          },
        },
        votes: userId
          ? {
              where: { userId },
              include: {
                option: true,
              },
            }
          : true,
      },
    });

    if (!poll) {
      throw new Error('투표를 찾을 수 없습니다.');
    }

    return this.formatPollResponse(poll, userId);
  }

  // 게시물 ID로 투표 조회
  async getPollByPostId(postId: string, userId?: string): Promise<PollResponse | null> {
    const poll = await prisma.poll.findUnique({
      where: { postId },
      include: {
        options: {
          include: {
            votes: true,
          },
        },
        votes: userId
          ? {
              where: { userId },
              include: {
                option: true,
              },
            }
          : true,
      },
    });

    if (!poll) {
      return null;
    }

    return this.formatPollResponse(poll, userId);
  }

  // 투표 수정
  async updatePoll(pollId: string, authorId: string, data: UpdatePollDto): Promise<PollResponse> {
    // 투표 존재 확인 및 권한 검증
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        post: true,
      },
    });

    if (!poll) {
      throw new Error('투표를 찾을 수 없습니다.');
    }

    if (poll.post.authorId !== authorId) {
      throw new Error('투표를 수정할 권한이 없습니다.');
    }

    const updatedPoll = await prisma.poll.update({
      where: { id: pollId },
      data,
      include: {
        options: {
          include: {
            votes: true,
          },
        },
        votes: {
          include: {
            option: true,
          },
        },
      },
    });

    return this.formatPollResponse(updatedPoll);
  }

  // 투표 삭제
  async deletePoll(pollId: string, authorId: string): Promise<void> {
    // 투표 존재 확인 및 권한 검증
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        post: true,
      },
    });

    if (!poll) {
      throw new Error('투표를 찾을 수 없습니다.');
    }

    if (poll.post.authorId !== authorId) {
      throw new Error('투표를 삭제할 권한이 없습니다.');
    }

    await prisma.poll.delete({
      where: { id: pollId },
    });
  }

  // 투표하기
  async vote(pollId: string, userId: string, data: VoteDto): Promise<VoteResponse> {
    const { optionId } = data;

    // 투표 활성 상태 및 만료일 확인
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true,
      },
    });

    if (!poll) {
      throw new Error('투표를 찾을 수 없습니다.');
    }

    if (!poll.isActive) {
      throw new Error('비활성화된 투표입니다.');
    }

    if (poll.expiresAt && new Date() > poll.expiresAt) {
      throw new Error('만료된 투표입니다.');
    }

    // 선택지 유효성 확인
    const option = poll.options.find((opt) => opt.id === optionId);
    if (!option) {
      throw new Error('유효하지 않은 선택지입니다.');
    }

    // 기존 투표 확인
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_pollId: {
          userId,
          pollId,
        },
      },
    });

    let vote;

    if (existingVote) {
      // 기존 투표 수정
      vote = await prisma.vote.update({
        where: { id: existingVote.id },
        data: { optionId },
        include: {
          option: true,
        },
      });
    } else {
      // 새 투표 생성
      vote = await prisma.vote.create({
        data: {
          userId,
          pollId,
          optionId,
        },
        include: {
          option: true,
        },
      });
    }

    return vote as VoteResponse;
  }

  // 투표 취소
  async cancelVote(pollId: string, userId: string): Promise<void> {
    const vote = await prisma.vote.findUnique({
      where: {
        userId_pollId: {
          userId,
          pollId,
        },
      },
    });

    if (!vote) {
      throw new Error('투표 기록을 찾을 수 없습니다.');
    }

    await prisma.vote.delete({
      where: { id: vote.id },
    });
  }

  // 투표 결과 조회
  async getPollResults(pollId: string, userId?: string): Promise<PollResultsResponse> {
    const poll = await this.getPollById(pollId, userId);

    return {
      poll: {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        totalVotes: poll.totalVotes,
        isActive: poll.isActive,
        expiresAt: poll.expiresAt,
      },
      options: poll.options,
      userVote: poll.userVote,
    };
  }

  // 투표 응답 포맷팅
  private formatPollResponse(poll: any, userId?: string): PollResponse {
    const totalVotes = poll.options.reduce(
      (sum: number, option: any) => sum + option.votes.length,
      0
    );

    const options: PollOptionResponse[] = poll.options.map((option: any) => ({
      id: option.id,
      text: option.text,
      voteCount: option.votes.length,
      percentage: totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0,
    }));

    let userVote: string | undefined;
    if (userId && poll.votes) {
      const userVoteRecord = poll.votes.find((vote: any) => vote.userId === userId);
      userVote = userVoteRecord?.optionId;
    }

    return {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      postId: poll.postId,
      isActive: poll.isActive,
      expiresAt: poll.expiresAt,
      createdAt: poll.createdAt,
      updatedAt: poll.updatedAt,
      options,
      totalVotes,
      userVote,
    };
  }

  // 투표 만료 확인 및 비활성화
  async checkAndDeactivateExpiredPolls(): Promise<void> {
    await prisma.poll.updateMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
  }
}
