// cart.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// 장바구니 조회
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
      return res.json({ items: [] });
    }
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 장바구니 아이템 추가
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: '제품을 찾을 수 없습니다.' });
    }
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }
    const cartItemIndex = cart.items.findIndex(item => item.product.equals(productId));
    if (cartItemIndex > -1) {
      cart.items[cartItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 장바구니 아이템 삭제
router.post('/remove', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ error: '장바구니가 비어 있습니다.' });
    }
    cart.items = cart.items.filter(item => !item.product.equals(productId));
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;