// routes/users.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

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