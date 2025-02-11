import express from 'express';
import 'dotenv/config';
import router from './routes/index.js';

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);

app.get('/', (req, res) => {
  res.send('Hello World!!');
});

app.listen(PORT, () => {
  console.log('서버 실행중...');
});
