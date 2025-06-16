import { Post, User, Vote, UserVote } from '@prisma/client';

// 투표 항목 응답 타입
export interface VoteResponse {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
  userVoted: boolean;
}

// 투표 기록 응답 타입
export interface UserVoteResponse {
  id: string;
  userId: string;
  voteId: string;
  createdAt: Date;
}

// 게시물 생성 DTO
export interface CreatePostDto {
  title: string;
  content: string;
  isPoll?: boolean;
  isPollActive?: boolean;
  pollExpiresAt?: Date;
  votes?: string[]; // 투표 항목 텍스트 배열
}

// 게시물 수정 DTO
export interface UpdatePostDto {
  title?: string;
  content?: string;
  isPollActive?: boolean;
  pollExpiresAt?: Date;
}

// 투표 DTO
export interface VoteDto {
  voteId: string;
}

// 게시물 응답 타입
export interface PostResponse {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    nickname: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isPoll: boolean;
  isPollActive: boolean;
  pollExpiresAt: Date | null;
  votes: VoteResponse[];
  totalVotes: number;
  userVoted: boolean;
}

// 게시물 목록 응답 타입
export interface PostsResponse {
  posts: PostResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 게시물 상세 정보 타입 (Prisma 모델 확장)
export type PostWithDetails = Post & {
  author: Pick<User, 'id' | 'nickname'>;
  votes: (Vote & {
    userVotes: (UserVote & {
      user: Pick<User, 'id'>;
    })[];
  })[];
};

export interface GetPostsQuery {
  page?: number;
  limit?: number;
  search?: string;
}
