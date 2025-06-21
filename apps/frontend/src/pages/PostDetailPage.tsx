'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api.service';
import Header from '../components/Header';
import { formatKstDate, getTimeLeft } from '../utils/date.util';

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
  const { isAuthenticated, user } = useAuth();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [voting, setVoting] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // 게시물 삭제
  const handleDelete = async () => {
    if (!post) return;

    if (!window.confirm('정말로 이 게시물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setDeleting(true);
      await apiFetch(`/post/${id}`, {
        method: 'DELETE',
      });

      alert('게시물이 성공적으로 삭제되었습니다.');
      navigate('/');
    } catch (error: unknown) {
      console.error('게시물 삭제 실패:', error);
      alert(error instanceof Error ? error.message : '게시물 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
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
    return formatKstDate(date);
  };

  const getTimeLeftForPoll = () => {
    return getTimeLeft(post.pollExpiresAt);
  };

  const isAuthor = user?.id === post.author.id;

  return (
    <div className="post-detail-page">
      <Header />

      {/* 메인 컨텐츠 */}
      <main className="post-detail-main">
        <article className="post-detail-article">
          {/* 게시물 헤더 */}
          <header className="post-detail-article-header">
            <div className="post-detail-header-content">
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
            </div>

            {/* 작성자만 수정/삭제 버튼 표시 */}
            {isAuthor && (
              <div className="post-detail-actions">
                <Link to={`/post/${id}/edit`} className="edit-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  수정
                </Link>
                <button onClick={handleDelete} className="delete-btn" disabled={deleting}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  {deleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            )}
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
                  <span className="poll-timer">{getTimeLeftForPoll()}</span>
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
