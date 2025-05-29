import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

// 미들웨어
app.use(cors());
app.use(express.json());

// 타입 정의
interface Food {
  id: number;
  name: string;
  category: string;
}

// 임시 데이터
const foods: Food[] = [
  { id: 1, name: '김치찌개', category: '한식' },
  { id: 2, name: '피자', category: '양식' },
  { id: 3, name: '초밥', category: '일식' },
];

// 라우트
app.get('/api/foods', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: foods,
  });
});

app.listen(port, () => {
  console.log(`서버가 포트 ${port}에서 실행 중입니다`);
});
