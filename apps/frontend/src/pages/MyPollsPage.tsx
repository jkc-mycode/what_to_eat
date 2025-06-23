import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api.service';
import { getTimeLeft } from '../utils/date.util';

interface VoteResponse {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
  userVoted: boolean;
}

interface PostResponse {
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
  votes?: VoteResponse[];
  totalVotes?: number;
  userVoted?: boolean;
}

interface PostsResponse {
  posts: PostResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const MyPollsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'written' | 'voted'>('written');
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await apiFetch('/post');
        setPosts(response.data.posts);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : '게시물 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // 내가 작성한 게시물
  const myWrittenPosts = posts.filter((post) => post.author.id === user?.id);
  // 내가 투표한 게시물
  const myVotedPosts = posts.filter(
    (post) => post.isPoll && post.votes && post.votes.some((vote) => vote.userVoted)
  );

  const renderPostCard = (post: PostResponse) => (
    <Link key={post.id} to={`/post/${post.id}`} className="poll-card-link">
      <div className="poll-card">
        <div className="poll-card-content">
          <div className="poll-card-info">
            <div className="poll-card-title">{post.title}</div>
            <div className="poll-card-meta">
              <span className="poll-card-votes">{post.totalVotes || 0} votes</span>
              <span className="poll-card-dot">•</span>
              {post.isPoll &&
                post.isPollActive &&
                post.pollExpiresAt &&
                (() => {
                  const timeLeft = getTimeLeft(post.pollExpiresAt);
                  if (timeLeft) {
                    const daysMatch = timeLeft.match(/(\d+)일/);
                    const daysLeft = daysMatch ? parseInt(daysMatch[1]) : 0;
                    return <span className="poll-card-status active">{daysLeft} days left</span>;
                  }
                  return <span className="poll-card-status closed">Closed</span>;
                })()}
              {post.isPoll && !post.isPollActive && (
                <span className="poll-card-status closed">Closed</span>
              )}
              {post.isPoll && post.isPollActive && !post.pollExpiresAt && (
                <span className="poll-card-status active">Active</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <>
      <Header />
      <main className="main">
        <div className="main-header">
          <h1 className="main-title">My Polls</h1>
          <p className="main-subtitle">
            내가 작성한 게시물과 내가 투표한 게시물을 확인할 수 있습니다.
          </p>
        </div>
        <div className="tabs-section">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'written' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('written')}
            >
              내가 작성한 게시물
            </button>
            <button
              className={`tab ${activeTab === 'voted' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('voted')}
            >
              내가 투표한 게시물
            </button>
          </div>
        </div>
        <div className="polls-section">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (activeTab === 'written' ? myWrittenPosts : myVotedPosts).length === 0 ? (
            <div className="no-posts">
              <p>게시물이 없습니다.</p>
            </div>
          ) : (
            (activeTab === 'written' ? myWrittenPosts : myVotedPosts).map(renderPostCard)
          )}
        </div>
      </main>
    </>
  );
};

export default MyPollsPage;
