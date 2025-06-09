export interface CreatePostDto {
  title: string;
  content: string;
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
