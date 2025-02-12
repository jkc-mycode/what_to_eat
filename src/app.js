import express from 'express';
import 'dotenv/config';
import router from './routes/index.js';
import expressSession from 'express-session';
import errorHandlerMiddleware from './middlewares/error-handler.js';
import { prisma } from './utils/prisma.js';

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);
app.use('/api', router);

app.get('/', (req, res) => {
  res.send('Hello World!!');
});

app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log('서버 실행중...');
});
