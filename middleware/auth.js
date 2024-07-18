// middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 토큰을 헤더에서 가져옵니다.
  const token = req.header('x-auth-token');

  // 토큰이 없으면 접근을 거부합니다.
  if (!token) {
    return res.status(401).json({ msg: '인증 토큰이 없습니다. 접근이 거부되었습니다.' });
  }

  try {
    // 토큰을 복호화합니다.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 요청 객체에 사용자 정보를 추가합니다.
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: '토큰이 유효하지 않습니다.' });
  }
};