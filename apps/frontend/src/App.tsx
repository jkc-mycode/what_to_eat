import { useState } from 'react';
import { Button, Card } from './components';
import './App.css';

interface Food {
  id: number;
  name: string;
  category: string;
}

function App() {
  const [count, setCount] = useState(0);

  // 임시 데이터
  const foods: Food[] = [
    { id: 1, name: '김치찌개', category: '한식' },
    { id: 2, name: '피자', category: '양식' },
    { id: 3, name: '초밥', category: '일식' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">무엇을 먹을까?</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {foods.map((food) => (
          <Card key={food.id} title={food.name}>
            <p className="mb-2">카테고리: {food.category}</p>
            <Button variant="primary" onClick={() => alert(`${food.name}을(를) 선택했습니다!`)}>
              선택하기
            </Button>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="mb-2">버튼 클릭 횟수: {count}</p>
        <Button variant="secondary" onClick={() => setCount(count + 1)}>
          카운트 증가
        </Button>
      </div>
    </div>
  );
}

export default App;
