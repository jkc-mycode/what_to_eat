import { prisma } from '../utils/prisma.util';
import {
  CreatePostDto,
  UpdatePostDto,
  PostResponse,
  PostListResponse,
  GetPostsQuery,
  CreatePostWithPollDto,
} from '../types/post.types';
import { PollService } from './poll.service';

export class PostService {
  private pollService = new PollService();

  // 게시물 생성
  async createPost(authorId: string, data: CreatePostDto): Promise<PostResponse> {
    const { title, content } = data;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
    });

    return post;
  }

  // 투표와 함께 게시물 생성
  async createPostWithPoll(authorId: string, data: CreatePostWithPollDto): Promise<PostResponse> {
    const { title, content, poll } = data;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
    });

    // 투표 생성 (있는 경우)
    if (poll) {
      await this.pollService.createPoll(post.id, poll);
    }

    return post;
  }

  // 게시물 목록 조회 (페이지네이션 포함)
  async getPosts(query: GetPostsQuery): Promise<PostListResponse> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    // 삭제되지 않았고, search에 해당하는 게시물만 조회
    const where = {
      deletedAt: null,
      ...(search && {
        OR: [{ title: { contains: search } }, { content: { contains: search } }],
      }),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ]);

    // 각 게시물에 투표 정보 추가
    const postsWithPoll = await Promise.all(
      posts.map(async (post) => {
        const poll = await this.pollService.getPollByPostId(post.id);
        return {
          ...post,
          poll: poll
            ? {
                id: poll.id,
                title: poll.title,
                description: poll.description,
                isActive: poll.isActive,
                expiresAt: poll.expiresAt,
                options: poll.options,
                totalVotes: poll.totalVotes,
              }
            : undefined,
        };
      })
    );

    return {
      posts: postsWithPoll,
      total,
      page,
      limit,
    };
  }

  // 게시물 단일 조회
  async getPostById(id: string): Promise<PostResponse> {
    const post = await prisma.post.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      throw new Error('게시물을 찾을 수 없습니다.');
    }

    // 투표 정보 추가
    const poll = await this.pollService.getPollByPostId(post.id);

    return {
      ...post,
      poll: poll
        ? {
            id: poll.id,
            title: poll.title,
            description: poll.description,
            isActive: poll.isActive,
            expiresAt: poll.expiresAt,
            options: poll.options,
            totalVotes: poll.totalVotes,
          }
        : undefined,
    };
  }

  // 게시물 수정
  async updatePost(id: string, authorId: string, data: UpdatePostDto): Promise<PostResponse> {
    // 게시물 존재 확인 및 작성자 검증 (삭제되지 않은 게시물만)
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingPost) {
      throw new Error('게시물을 찾을 수 없습니다.');
    }

    if (existingPost.authorId !== authorId) {
      throw new Error('게시물을 수정할 권한이 없습니다.');
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
    });

    return updatedPost;
  }

  // 게시물 삭제
  async deletePost(id: string, authorId: string): Promise<void> {
    // 게시물 존재 확인 및 작성자 검증 (삭제되지 않은 게시물만)
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingPost) {
      throw new Error('게시물을 찾을 수 없습니다.');
    }

    if (existingPost.authorId !== authorId) {
      throw new Error('게시물을 삭제할 권한이 없습니다.');
    }

    // Soft Delete
    await prisma.post.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
