const express = require('express');
const cors = require('cors');
const productsRouter = require('./routes/products');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.use('/api/products', productsRouter);

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});