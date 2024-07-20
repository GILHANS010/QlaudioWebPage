// products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// 모든 제품 조회
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 특정 제품 조회
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: '제품을 찾을 수 없습니다.' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 제품 등록 (관리자용)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, stock } = req.body;
    const newProduct = new Product({ name, description, price, imageUrl, category, stock });
    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 제품 수정 (관리자용)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, imageUrl, category, stock },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ error: '제품을 찾을 수 없습니다.' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 제품 삭제 (관리자용)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findByIdAndRemove(req.params.id);
    if (!product) {
      return res.status(404).json({ error: '제품을 찾을 수 없습니다.' });
    }
    res.json({ message: '제품이 삭제되었습니다.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;