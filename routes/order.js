// orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');
const { sendOrderConfirmationEmail } = require('../utils/emailService');

// 사용자 주문 조회
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 주문 생성
router.post('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      return res.status(400).json({ error: '장바구니가 비어있습니다.' });
    }
    
    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      totalAmount: cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0),
      paymentStatus: 'Paid'
    });
    
    await order.save();
    await Cart.findOneAndDelete({ user: req.user.id });
    
    // 주문 확인 이메일 발송
    sendOrderConfirmationEmail(req.user.email, order);
    
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
