'use client';

import type React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData);
      // 로그인 성공 시 메인 페이지로 이동
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="logo-link">
            <div className="logo">
              <div className="logo-icon">
                <span>?</span>
              </div>
              &nbsp;
              <span className="logo-text">What To Eat?</span>
            </div>
          </Link>
          <h1 className="auth-title">로그인</h1>
          <p className="auth-subtitle">계정에 로그인하여 음식 투표에 참여하세요</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" className="checkbox" />
              <span className="checkbox-text">로그인 상태 유지</span>
            </label>
            <Link to="/forgot-password" className="forgot-password">
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <button type="submit" className="auth-button">
            로그인
          </button>
        </form>

        <div className="auth-divider">
          <span className="divider-text">또는</span>
        </div>

        <div className="social-auth">
          <a
            href="http://localhost:3000/api/auth/kakao"
            className="social-button kakao"
            style={{ backgroundColor: '#FEE500', color: '#3C1E1E' }}
          >
            <svg className="social-icon" viewBox="0 0 24 24">
              <ellipse cx="12" cy="12" rx="12" ry="12" fill="#FEE500" />
              <path
                d="M12 6.5c-3.59 0-6.5 2.15-6.5 4.8 0 1.53 1.08 2.88 2.74 3.74-.12.44-.44 1.62-.51 1.89 0 0-.01.03 0 .04.07.14.23.13.32.09.13-.06 1.87-1.23 2.63-1.7.43.06.88.09 1.32.09 3.59 0 6.5-2.15 6.5-4.8S15.59 6.5 12 6.5z"
                fill="#3C1E1E"
              />
            </svg>
            카카오로 로그인
          </a>
        </div>

        <div className="auth-footer">
          <p className="auth-footer-text">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="auth-link">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
