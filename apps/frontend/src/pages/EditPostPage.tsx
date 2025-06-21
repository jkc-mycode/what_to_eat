'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../services/api.service';
import Header from '../components/Header';
import { toKstLocalString, fromKstLocalString } from '../utils/date.util';

interface EditPostForm {
  title: string;
  content: string;
  isPoll: boolean;
  isPollActive: boolean;
  pollExpiresAt: string;
  votes: string[];
}

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
  votes: Array<{
    id: string;
    text: string;
    voteCount: number;
    percentage: number;
    userVoted: boolean;
  }>;
  totalVotes: number;
  userVoted: boolean;
}

const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState<EditPostForm>({
    title: '',
    content: '',
    isPoll: false,
    isPollActive: true,
    pollExpiresAt: '',
    votes: ['', ''],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [post, setPost] = useState<PostDetail | null>(null);

  // 게시물 정보 가져오기
  useEffect(() => {
    // 로그인 상태 확인
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiFetch(`/post/${id}`);
        const postData = response.data;

        // 작성자 확인
        if (postData.author.id !== user?.id) {
          setError('게시물을 수정할 권한이 없습니다.');
          return;
        }

        setPost(postData);

        // 폼 데이터 설정
        setFormData({
          title: postData.title,
          content: postData.content,
          isPoll: postData.isPoll,
          isPollActive: postData.isPollActive,
          pollExpiresAt: postData.pollExpiresAt ? toKstLocalString(postData.pollExpiresAt) : '',
          votes: postData.isPoll
            ? postData.votes.map((vote: { text: string }) => vote.text)
            : ['', ''],
        });
      } catch (error: unknown) {
        console.error('게시물 조회 실패:', error);
        setError(error instanceof Error ? error.message : '게시물을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, user?.id, isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleVoteChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      votes: prev.votes.map((vote, i) => (i === index ? value : vote)),
    }));
  };

  const addVoteOption = () => {
    if (formData.votes.length >= 10) {
      alert('투표 옵션은 최대 10개까지 가능합니다.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      votes: [...prev.votes, ''],
    }));
  };

  const removeVoteOption = (index: number) => {
    if (formData.votes.length <= 2) {
      alert('투표 옵션은 최소 2개 이상 필요합니다.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      votes: prev.votes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    if (formData.isPoll) {
      const validVotes = formData.votes.filter((vote) => vote.trim());
      if (validVotes.length < 2) {
        setError('투표 옵션은 최소 2개 이상 필요합니다.');
        return;
      }

      // 중복 투표 옵션 체크
      const uniqueVotes = new Set(validVotes);
      if (uniqueVotes.size !== validVotes.length) {
        setError('투표 옵션에 중복된 항목이 있습니다.');
        return;
      }

      if (formData.pollExpiresAt && new Date(formData.pollExpiresAt) <= new Date()) {
        setError('투표 만료 시간은 현재 시간보다 이후여야 합니다.');
        return;
      }
    }

    try {
      setSaving(true);

      const requestData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        isPoll: formData.isPoll,
        isPollActive: formData.isPollActive,
        pollExpiresAt:
          formData.isPoll && formData.pollExpiresAt
            ? fromKstLocalString(formData.pollExpiresAt)
            : null,
        votes: formData.isPoll ? formData.votes.filter((vote) => vote.trim()) : undefined,
      };

      const response = await apiFetch(`/post/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(requestData),
      });

      if (response.success) {
        alert('게시물이 성공적으로 수정되었습니다!');
        navigate(`/post/${id}`);
      } else {
        setError(response.message || '게시물 수정에 실패했습니다.');
      }
    } catch (error: unknown) {
      console.error('게시물 수정 실패:', error);
      setError(error instanceof Error ? error.message : '게시물 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('수정 중인 내용이 사라집니다. 정말 나가시겠습니까?')) {
      navigate(`/post/${id}`);
    }
  };

  if (loading) {
    return (
      <div className="create-post-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>게시물을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="create-post-page">
        <Header />
        <div className="error-container">
          <h2>오류가 발생했습니다</h2>
          <p>{error || '게시물을 찾을 수 없습니다.'}</p>
          <button onClick={() => navigate('/')} className="back-button">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-post-page">
      <Header />

      <main className="create-post-main">
        <div className="create-post-container">
          <div className="create-post-header">
            <h1 className="create-post-title">게시물 수정</h1>
            <p className="create-post-subtitle">게시물 내용을 수정할 수 있습니다</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="create-post-form">
            {/* 게시물 타입 선택 */}
            <div className="form-group">
              <label className="form-label">게시물 타입</label>
              <div className="post-type-selector">
                <label className="post-type-option">
                  <input
                    type="radio"
                    name="isPoll"
                    checked={!formData.isPoll}
                    onChange={() => setFormData((prev) => ({ ...prev, isPoll: false }))}
                  />
                  <span className="post-type-text">일반 게시물</span>
                </label>
                <label className="post-type-option">
                  <input
                    type="radio"
                    name="isPoll"
                    checked={formData.isPoll}
                    onChange={() => setFormData((prev) => ({ ...prev, isPoll: true }))}
                  />
                  <span className="post-type-text">투표 게시물</span>
                </label>
              </div>
            </div>

            {/* 제목 */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="form-input"
                placeholder="게시물 제목을 입력하세요"
                maxLength={100}
                required
              />
            </div>

            {/* 내용 */}
            <div className="form-group">
              <label htmlFor="content" className="form-label">
                내용 *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="게시물 내용을 입력하세요"
                rows={6}
                required
              />
            </div>

            {/* 투표 관련 설정 */}
            {formData.isPoll && (
              <>
                {/* 투표 활성화 상태 */}
                <div className="form-group">
                  <label className="form-label">투표 설정</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isPollActive"
                        checked={formData.isPollActive}
                        onChange={handleInputChange}
                      />
                      <span className="checkbox-text">투표 활성화</span>
                    </label>
                  </div>
                </div>

                {/* 투표 만료 시간 */}
                <div className="form-group">
                  <label htmlFor="pollExpiresAt" className="form-label">
                    투표 만료 시간
                  </label>
                  <input
                    type="datetime-local"
                    id="pollExpiresAt"
                    name="pollExpiresAt"
                    value={formData.pollExpiresAt}
                    onChange={handleInputChange}
                    className="form-input"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <small className="form-help">
                    만료 시간을 설정하지 않으면 무제한으로 진행됩니다.
                  </small>
                </div>

                {/* 투표 옵션 */}
                <div className="form-group">
                  <label className="form-label">투표 옵션 * (최소 2개, 최대 10개)</label>
                  <div className="vote-options">
                    {formData.votes.map((vote, index) => (
                      <div key={index} className="vote-option-input">
                        <input
                          type="text"
                          value={vote}
                          onChange={(e) => handleVoteChange(index, e.target.value)}
                          className="form-input"
                          placeholder={`투표 옵션 ${index + 1}`}
                          maxLength={50}
                        />
                        {formData.votes.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeVoteOption(index)}
                            className="remove-vote-btn"
                            title="투표 옵션 제거"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {formData.votes.length < 10 && (
                    <button type="button" onClick={addVoteOption} className="add-vote-btn">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      투표 옵션 추가
                    </button>
                  )}
                </div>
              </>
            )}

            {/* 버튼 그룹 */}
            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="cancel-btn" disabled={saving}>
                취소
              </button>
              <button type="submit" className="submit-btn" disabled={saving}>
                {saving ? '수정 중...' : '게시물 수정'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditPostPage;
