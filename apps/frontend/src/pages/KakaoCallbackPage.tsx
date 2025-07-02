import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfileApi } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';

const KakaoCallbackPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      getProfileApi()
        .then((res) => {
          setUser(res.data.user);
        })
        .finally(() => {
          navigate('/');
        });
    } else {
      navigate('/');
    }
  }, [navigate, setUser]);

  return <div>카카오 로그인 처리 중...</div>;
};

export default KakaoCallbackPage;
