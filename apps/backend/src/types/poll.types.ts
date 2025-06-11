export interface CreatePollDto {
  title: string;
  description?: string;
  options: string[];
  expiresAt?: Date;
}

export interface UpdatePollDto {
  title?: string;
  description?: string;
  isActive?: boolean;
  expiresAt?: Date;
}

export interface CreatePollOptionDto {
  text: string;
}

export interface VoteDto {
  optionId: string;
}

export interface PollOptionResponse {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

export interface PollResponse {
  id: string;
  title: string;
  description: string | null;
  postId: string;
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  options: PollOptionResponse[];
  totalVotes: number;
  userVote?: string; // 현재 사용자의 투표한 옵션 ID
}

export interface PollResultsResponse {
  poll: {
    id: string;
    title: string;
    description: string | null;
    totalVotes: number;
    isActive: boolean;
    expiresAt: Date | null;
  };
  options: PollOptionResponse[];
  userVote?: string;
}

export interface CreatePostWithPollDto {
  title: string;
  content: string;
  poll?: CreatePollDto;
}

export interface VoteResponse {
  id: string;
  userId: string;
  pollId: string;
  optionId: string;
  createdAt: Date;
  option: {
    id: string;
    text: string;
  };
}
