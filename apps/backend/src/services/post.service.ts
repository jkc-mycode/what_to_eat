import { PrismaClient, Post, User, Vote, UserVote } from '@prisma/client';
import {
  CreatePostDto,
  UpdatePostDto,
  VoteDto,
  PostResponse,
  PostsResponse,
  PostWithDetails,
} from '../types/post.types';
import HttpException from '../utils/error-exception.util';

export class PostService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // 게시물 생성
  async createPost(userId: string, dto: CreatePostDto): Promise<PostResponse> {
    const { title, content, isPoll, isPollActive, pollExpiresAt, votes } = dto;

    // 투표 게시물인 경우 투표 항목 검증
    if (isPoll) {
      if (!votes || votes.length < 2) {
        throw new HttpException(400, '투표 항목은 최소 2개 이상 필요합니다.');
      }
      if (votes.length > 10) {
        throw new HttpException(400, '투표 항목은 최대 10개까지 가능합니다.');
      }
    }

    // 투표 게시물인 경우 투표 메뉴 중복 체크
    if (dto.isPoll && dto.votes) {
      const uniqueVotes = new Set(dto.votes);
      if (uniqueVotes.size !== dto.votes.length) {
        throw new HttpException(400, '투표 메뉴에 중복된 항목이 있습니다.');
      }
    }

    const post = await this.prisma.post.create({
      data: {
        title,
        content,
        authorId: userId,
        isPoll: isPoll || false,
        isPollActive: isPollActive ?? true,
        pollExpiresAt,
        votes: isPoll
          ? {
              create: votes!.map((text) => ({ text })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        votes: {
          include: {
            userVotes: {
              include: {
                user: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return this.formatPostResponse(post, userId);
  }

  // 게시물 수정
  async updatePost(postId: string, userId: string, dto: UpdatePostDto): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        votes: {
          include: {
            userVotes: {
              include: {
                user: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new HttpException(404, '게시물을 찾을 수 없습니다.');
    }

    if (post.authorId !== userId) {
      throw new HttpException(403, '게시물을 수정할 권한이 없습니다.');
    }

    // 투표 게시물인 경우 투표 메뉴 수정
    if (post.isPoll && dto.votes) {
      // 기존 투표 항목과 새로운 투표 항목 비교
      const existingVotes = post.votes;
      const newVotes = dto.votes;

      // 삭제할 투표 항목 찾기 (기존에 있지만 새로운 목록에는 없는 항목)
      const votesToDelete = existingVotes.filter((existing) => !newVotes.includes(existing.text));

      // 추가할 투표 항목 찾기 (새로운 목록에는 있지만 기존에는 없는 항목)
      const votesToAdd = newVotes.filter(
        (newVote) => !existingVotes.some((existing) => existing.text === newVote)
      );

      // 삭제할 투표 항목이 있는 경우
      if (votesToDelete.length > 0) {
        // 해당 투표 항목에 대한 모든 투표 기록 삭제
        await this.prisma.userVote.deleteMany({
          where: {
            voteId: {
              in: votesToDelete.map((vote) => vote.id),
            },
          },
        });

        // 투표 항목 삭제
        await this.prisma.vote.deleteMany({
          where: {
            id: {
              in: votesToDelete.map((vote) => vote.id),
            },
          },
        });
      }

      // 추가할 투표 항목이 있는 경우
      if (votesToAdd.length > 0) {
        await this.prisma.vote.createMany({
          data: votesToAdd.map((text) => ({
            postId,
            text,
          })),
        });
      }
    }

    // 게시물 정보 업데이트
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        title: dto.title,
        content: dto.content,
        isPoll: dto.isPoll,
        isPollActive: dto.isPollActive,
        pollExpiresAt: dto.pollExpiresAt,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        votes: {
          include: {
            userVotes: {
              include: {
                user: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    // 성공 시 아무것도 반환하지 않음
  }

  // 게시물 삭제
  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new HttpException(404, '게시물을 찾을 수 없습니다.');
    }

    if (post.authorId !== userId) {
      throw new HttpException(403, '게시물을 삭제할 권한이 없습니다.');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });
    // 성공 시 아무것도 반환하지 않음
  }

  // 게시물 목록 조회
  async getPosts(page: number = 1, limit: number = 10): Promise<PostsResponse> {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
          votes: {
            include: {
              userVotes: {
                include: {
                  user: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.post.count(),
    ]);

    return {
      posts: posts.map((post) => this.formatPostListResponse(post)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 게시물 상세 조회
  async getPost(postId: string, userId: string | null): Promise<PostResponse> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        votes: {
          include: {
            userVotes: {
              include: {
                user: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new HttpException(404, '게시물을 찾을 수 없습니다.');
    }

    return this.formatPostResponse(post, userId);
  }

  // 투표 게시물 검증
  private async validateVotePost(postId: string, userId: string, voteId: string) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        include: {
          votes: {
            include: {
              userVotes: {
                include: {
                  user: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!post) {
        throw new HttpException(404, '게시물을 찾을 수 없습니다.');
      }

      if (!post.isPoll) {
        throw new HttpException(400, '투표 게시물이 아닙니다.');
      }

      if (!post.isPollActive) {
        throw new HttpException(400, '종료된 투표입니다.');
      }

      // 만료 시간 확인 로직 개선
      if (post.pollExpiresAt && post.pollExpiresAt < new Date()) {
        throw new HttpException(400, '만료된 투표입니다.');
      }

      const vote = post.votes.find((v) => v.id === voteId);
      if (!vote) {
        throw new HttpException(404, '투표 항목을 찾을 수 없습니다.');
      }

      return { post, vote };
    } catch (error) {
      console.error('투표 게시물 검증 중 오류 발생:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, '투표 게시물 검증 중 오류가 발생했습니다.');
    }
  }

  // 투표하기
  async vote(postId: string, userId: string, dto: VoteDto): Promise<void> {
    try {
      const { voteId } = dto;

      // 투표 게시물 검증
      const { post } = await this.validateVotePost(postId, userId, voteId);

      // 이미 투표했는지 확인
      const existingVote = await this.prisma.userVote.findFirst({
        where: {
          userId,
          vote: {
            postId,
          },
        },
      });

      if (existingVote) {
        throw new HttpException(400, '이미 투표했습니다.');
      }

      // 투표 생성
      await this.prisma.userVote.create({
        data: {
          userId,
          voteId,
        },
      });
      // 성공 시 아무것도 반환하지 않음
    } catch (error) {
      console.error('투표 처리 중 오류 발생:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(500, '투표 중 오류가 발생했습니다.');
    }
  }

  // 투표 취소
  async cancelVote(postId: string, userId: string, dto: VoteDto): Promise<void> {
    const { voteId } = dto;

    // 투표 게시물 검증
    await this.validateVotePost(postId, userId, voteId);

    // 사용자의 투표 확인
    const userVote = await this.prisma.userVote.findUnique({
      where: {
        userId_voteId: {
          userId,
          voteId,
        },
      },
    });

    if (!userVote) {
      throw new HttpException(400, '해당 항목에 투표한 기록이 없습니다.');
    }

    // 투표 취소
    await this.prisma.userVote.delete({
      where: {
        userId_voteId: {
          userId,
          voteId,
        },
      },
    });
    // 성공 시 아무것도 반환하지 않음
  }

  // 게시물 응답 포맷팅
  private formatPostResponse(post: PostWithDetails, userId: string | null): PostResponse {
    const totalVotes = post.votes.reduce((sum, vote) => sum + vote.userVotes.length, 0);
    const userVoted = userId
      ? post.votes.some((vote) => vote.userVotes.some((userVote) => userVote.user.id === userId))
      : false;

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author: {
        id: post.author.id,
        nickname: post.author.nickname || '',
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isPoll: post.isPoll,
      isPollActive: post.isPollActive,
      pollExpiresAt: post.pollExpiresAt,
      votes: post.votes.map((vote) => ({
        id: vote.id,
        text: vote.text,
        voteCount: vote.userVotes.length,
        percentage: totalVotes > 0 ? (vote.userVotes.length / totalVotes) * 100 : 0,
        userVoted: userId ? vote.userVotes.some((userVote) => userVote.user.id === userId) : false,
      })),
      totalVotes,
      userVoted,
    };
  }

  // 게시물 목록 조회 포멧팅 (votes 데이터 제외)
  private formatPostListResponse(post: PostWithDetails): PostResponse {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      author: {
        id: post.author.id,
        nickname: post.author.nickname || '',
      },
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isPoll: post.isPoll,
      isPollActive: post.isPollActive,
      pollExpiresAt: post.pollExpiresAt,
    };
  }
}
