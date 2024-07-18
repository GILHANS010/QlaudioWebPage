// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');  // CORS 미들웨어 추가
const app = express();
const port = 3000;

// 미들웨어 설정
app.use(cors());  // CORS 미들웨어 사용
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB 연결
mongoose.connect('mongodb://localhost/qlaudio', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 라우트 설정
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// 홈 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 컨택트 폼 제출 처리를 위한 API 엔드포인트
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  console.log('Received contact form submission:', { name, email, message });
  // 여기에 이메일 전송 로직이나 데이터베이스 저장 로직을 추가할 수 있습니다.
  res.json({ success: true, message: '메시지가 성공적으로 전송되었습니다.' });
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

app.use('/api/auth', (req, res, next) => {
  console.log('Auth route accessed');
  next();
}, authRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);