const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const filePath = path.join(__dirname, '../data/products.json');

function readData() {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Валидация товара
function validateProduct(body) {
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return 'Название должно быть непустой строкой';
  }
  if (typeof body.quantity !== 'number' || !Number.isInteger(body.quantity) || body.quantity < 0) {
    return 'Количество должно быть целым неотрицательным числом';
  }
  if (typeof body.price !== 'number' || body.price < 0) {
    return 'Цена должна быть положительным числом';
  }
  return null;
}

// GET /api/products?page=1 — список с пагинацией и статистикой
router.get('/', (req, res) => {
  const products = readData();
  const page = Number(req.query.page) || 1;
  const limit = 3; // по заданию — 3 записи на страницу
  const start = (page - 1) * limit;
  const end = start + limit;

  // Статистика считается по ВСЕМ товарам, а не только по текущей странице
  const totalPositions = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

  res.status(200).json({
    items: products.slice(start, end),
    page,
    totalPages: Math.ceil(products.length / limit),
    totalPositions,
    totalValue,
  });
});

// GET /api/products/:id — один товар
router.get('/:id', (req, res) => {
  const product = readData().find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.status(200).json(product);
});

// POST /api/products — создание
router.post('/', (req, res) => {
  const error = validateProduct(req.body);
  if (error) return res.status(400).json({ error });

  const products = readData();
  const newProduct = { id: Date.now(), ...req.body };
  products.push(newProduct);
  writeData(products);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id — обновление
router.put('/:id', (req, res) => {
  const error = validateProduct(req.body);
  if (error) return res.status(400).json({ error });

  const products = readData();
  const index = products.findIndex(p => p.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Not found' });

  products[index] = { ...products[index], ...req.body };
  writeData(products);
  res.status(200).json(products[index]);
});

// DELETE /api/products/:id — удаление
router.delete('/:id', (req, res) => {
  const products = readData().filter(p => p.id !== Number(req.params.id));
  writeData(products);
  res.status(200).json({ message: 'Deleted' });
});

module.exports = router;