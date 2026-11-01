const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
// Обрати внимание: путь должен вести в папку data в корне проекта
const filePath = path.join(__dirname, '../data/animals.json');

function readData() {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function writeData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// GET - список
router.get('/', (req, res) => {
    res.status(200).json(readData());
});

// GET - один по id
router.get('/:id', (req, res) => {
    const animal = readData().find(a => a.id === Number(req.params.id));
    if (!animal) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(animal);
});

// POST - создание
router.post('/', (req, res) => {
    const animals = readData();
    const newAnimal = { id: Date.now(), ...req.body };
    animals.push(newAnimal);
    writeData(animals);
    res.status(201).json(newAnimal);
});

// PUT - обновление
router.put('/:id', (req, res) => {
    const animals = readData();
    const index = animals.findIndex(a => a.id === Number(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Not found' });
    animals[index] = { ...animals[index], ...req.body };
    writeData(animals);
    res.status(200).json(animals[index]);
});

// DELETE - удаление
router.delete('/:id', (req, res) => {
    const animals = readData().filter(a => a.id !== Number(req.params.id));
    writeData(animals);
    res.status(200).json({ message: 'Deleted' });
});

module.exports = router;