'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api.service';
import Header from '../components/Header';

// 투표 옵션 타입
interface VoteOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
  userVoted: boolean;
}

// 게시물 상세 타입
interface PostDetail {
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
  votes: VoteOption[];
  totalVotes: number;
  userVoted: boolean;
}

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [voting, setVoting] = useState(false);

  // 게시물 상세 정보 가져오기
  const fetchPostDetail = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiFetch(`/post/${id}`);
      setPost(response.data);
    } catch (error: unknown) {
      console.error('게시물 상세 조회 실패:', error);
      setError(error instanceof Error ? error.message : '게시물을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 투표하기
  const handleVote = async (voteId: string) => {
    if (!isAuthenticated) {
      alert('투표하려면 로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!post?.isPollActive) {
      alert('투표가 종료되었습니다.');
      return;
    }

    try {
      setVoting(true);
      await apiFetch(`/post/${id}/vote`, {
        method: 'POST',
        body: JSON.stringify({ voteId }),
      });

      // 투표 후 게시물 정보 다시 가져오기
      await fetchPostDetail();
    } catch (error: unknown) {
      console.error('투표 실패:', error);
      alert(error instanceof Error ? error.message : '투표에 실패했습니다.');
    } finally {
      setVoting(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPostDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>게시물을 불러오는 중...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="error-container">
        <h2>오류가 발생했습니다</h2>
        <p>{error || '게시물을 찾을 수 없습니다.'}</p>
        <Link to="/" className="back-button">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeLeft = () => {
    if (!post.pollExpiresAt) return null;
    const msLeft = new Date(post.pollExpiresAt).getTime() - Date.now();
    if (msLeft <= 0) return null;

    const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}일 ${hours}시간 남음`;
    return `${hours}시간 남음`;
  };

  return (
    <div className="post-detail-page">
      <Header />

      {/* 메인 컨텐츠 */}
      <main className="post-detail-main">
        <article className="post-detail-article">
          {/* 게시물 헤더 */}
          <header className="post-detail-article-header">
            <h1 className="post-detail-title">{post.title}</h1>
            <div className="post-detail-meta">
              <span className="post-detail-author">작성자: {post.author.nickname}</span>
              <span className="post-detail-date">작성일: {formatDate(post.createdAt)}</span>
              {post.isPoll && (
                <span className={`post-detail-status ${post.isPollActive ? 'active' : 'closed'}`}>
                  {post.isPollActive ? '투표 진행 중' : '투표 종료'}
                </span>
              )}
            </div>
          </header>

          {/* 게시물 내용 */}
          <div className="post-detail-content">
            <p>{post.content}</p>
          </div>

          {/* 투표 섹션 */}
          {post.isPoll && (
            <div className="poll-section">
              <div className="poll-header">
                <h3 className="poll-title">투표</h3>
                {post.isPollActive && post.pollExpiresAt && (
                  <span className="poll-timer">{getTimeLeft()}</span>
                )}
                <span className="poll-total-votes">총 {post.totalVotes}표</span>
              </div>

              <div className="poll-options">
                {post.votes.map((vote) => (
                  <div key={vote.id} className="poll-option">
                    <button
                      className={`poll-option-button ${vote.userVoted ? 'voted' : ''} ${
                        !post.isPollActive ? 'disabled' : ''
                      }`}
                      onClick={() => handleVote(vote.id)}
                      disabled={voting || !post.isPollActive || vote.userVoted}
                    >
                      <div className="poll-option-content">
                        <span className="poll-option-text">{vote.text}</span>
                        <span className="poll-option-count">{vote.voteCount}표</span>
                      </div>
                      <div className="poll-option-bar">
                        <div
                          className="poll-option-progress"
                          style={{ width: `${vote.percentage}%` }}
                        ></div>
                      </div>
                      <span className="poll-option-percentage">{vote.percentage}%</span>
                    </button>
                  </div>
                ))}
              </div>

              {!post.isPollActive && (
                <div className="poll-closed-message">
                  <p>투표가 종료되었습니다.</p>
                </div>
              )}
            </div>
          )}
        </article>
      </main>
    </div>
  );
};

export default PostDetailPage;
