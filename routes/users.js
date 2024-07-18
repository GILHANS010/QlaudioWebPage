const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: '이미 존재하는 사용자입니다.' });
    }
    user = new User({ username, email, password });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: '유효하지 않은 자격증명입니다.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: '유효하지 않은 자격증명입니다.' });
    }
    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 비밀번호 재설정 요청
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      to: user.email,
      from: 'noreply@qlaudio.com',
      subject: '비밀번호 재설정',
      text: `비밀번호를 재설정하려면 다음 링크를 클릭하세요: http://localhost:3000/reset-password/${resetToken}`
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: '비밀번호 재설정 이메일을 전송했습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 비밀번호 재설정
router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ error: '비밀번호 재설정 토큰이 유효하지 않거나 만료되었습니다.' });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: '비밀번호가 재설정되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 사용자 프로필 조회
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 사용자 프로필 수정
router.put('/profile', auth, async (req, res) => {
  const { username, email } = req.body;
  try {
    let user = await User.findById(req.user.id);
    if (username) user.username = username;
    if (email) user.email = email;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
