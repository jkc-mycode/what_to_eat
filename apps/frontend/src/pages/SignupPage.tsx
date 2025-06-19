'use client';

import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!agreedToTerms) {
      alert('이용약관에 동의해주세요.');
      return;
    }
    // TODO: 회원가입 로직 구현
    console.log('Signup attempt:', formData);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="logo-link">
            <div className="logo">
              <div className="logo-icon"></div>&nbsp;
              <span className="logo-text">What To Eat?</span>
            </div>
          </Link>
          <h1 className="auth-title">회원가입</h1>
          <p className="auth-subtitle">새 계정을 만들어 음식 투표에 참여하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              이름
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="이름을 입력하세요"
              required
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="form-input"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <span className="checkbox-text">
                <Link to="/terms" className="terms-link">
                  이용약관
                </Link>{' '}
                및{' '}
                <Link to="/privacy" className="terms-link">
                  개인정보처리방침
                </Link>
                에 동의합니다
              </span>
            </label>
          </div>

          <button type="submit" className="auth-button">
            회원가입
          </button>
        </form>

        <div className="auth-divider">
          <span className="divider-text">또는</span>
        </div>

        <div className="social-auth">
          <button className="social-button google">
            <svg className="social-icon" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google로 회원가입
          </button>
        </div>

        <div className="auth-footer">
          <p className="auth-footer-text">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="auth-link">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
