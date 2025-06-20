'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// 백엔드 API 응답 타입
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

// 백엔드 API 응답 래퍼 타입
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // AuthContext에서 상태와 함수 가져오기
  const { user, isAuthenticated, logout } = useAuth();

  // API 기본 URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const tabs = ['All', 'Active', 'Closed'];

  // 백엔드 API에서 게시물 목록 가져오기
  const fetchPosts = async (page: number = 1, search?: string) => {
    try {
      setLoading(true);
      setError('');

      // API URL 구성
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`${API_BASE_URL}/post?${params}`);

      if (!response.ok) {
        throw new Error('게시물 목록을 가져오는데 실패했습니다.');
      }

      const apiResponse: ApiResponse<PostsResponse> = await response.json();

      if (apiResponse.success) {
        setPosts(apiResponse.data.posts);
        setTotalPages(apiResponse.data.totalPages);
        setCurrentPage(apiResponse.data.page);
      } else {
        throw new Error(apiResponse.message || '게시물 목록을 가져오는데 실패했습니다.');
      }
    } catch (error: unknown) {
      console.error('API 호출 실패:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 게시물 목록 가져오기
  useEffect(() => {
    fetchPosts(1, searchQuery);
  }, []);

  // 검색어 변경 시 API 호출
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPosts(1, searchQuery);
    }, 500); // 500ms 딜레이로 디바운싱

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // 페이지 변경 시 API 호출
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPosts(page, searchQuery);
  };

  // 탭 필터링 (클라이언트 사이드)
  const filteredPosts = posts.filter((post) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Active' && post.isPollActive) return true;
    if (activeTab === 'Closed' && !post.isPollActive) return true;
    return false;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>게시물을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <>
      {/* Navigation Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">
                <span>?</span>
              </div>
              &nbsp;
              <span className="logo-text">What To Eat?</span>
            </div>
            <nav className="nav">
              <Link to="/" className="nav-link active">
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/create-poll" className="nav-link">
                    Create Poll
                  </Link>
                  <Link to="/my-polls" className="nav-link">
                    My Polls
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="header-right">
            <div className="search-container">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input type="text" placeholder="Search" className="search-input" />
            </div>
            {isAuthenticated ? (
              <>
                <button className="notification-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </button>
                <div className="avatar">
                  <span>{user?.nickname?.[0]}</span>
                </div>
                <div className="user-menu">
                  <span>{user?.nickname}님</span>
                  <button onClick={logout} className="logout-btn">
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="auth-btn">
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        <div className="main-header">
          <h1 className="main-title">Food Polls</h1>
          <p className="main-subtitle">
            Explore the latest food polls and vote for your favorite dishes
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <svg className="search-bar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              placeholder="Search for polls"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-bar-input"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Tabs */}
        <div className="tabs-section">
          <div className="tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Poll Cards */}
        <div className="polls-section">
          {filteredPosts.length === 0 ? (
            <div className="no-posts">
              <p>게시물이 없습니다.</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="poll-card">
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
                          const msLeft = new Date(post.pollExpiresAt).getTime() - Date.now();
                          const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
                          return (
                            <span className="poll-card-status active">{daysLeft} days left</span>
                          );
                        })()}
                      {post.isPoll && !post.isPollActive && (
                        <span className="poll-card-status closed">Closed</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="15,18 9,12 15,6"></polyline>
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </main>
    </>
  );
};

export default HomePage;
