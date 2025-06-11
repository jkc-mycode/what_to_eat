export interface CreatePostDto {
  title: string;
  content: string;
}

export interface CreatePostWithPollDto {
  title: string;
  content: string;
  poll?: {
    title: string;
    description?: string;
    options: string[];
    expiresAt?: Date;
  };
}

export interface UpdatePostDto {
  title?: string;
  content?: string;
}

export interface PostResponse {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    nickname: string | null;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  poll?: {
    id: string;
    title: string;
    description: string | null;
    isActive: boolean;
    expiresAt: Date | null;
    options: {
      id: string;
      text: string;
      voteCount: number;
      percentage: number;
    }[];
    totalVotes: number;
  };
}

export interface PostListResponse {
  posts: PostResponse[];
  total: number;
  page: number;
  limit: number;
}

export interface GetPostsQuery {
  page?: number;
  limit?: number;
  search?: string;
}
