import React from 'react';

const API_URL = 'http://localhost:4000/api/products';

export default function App() {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Пагинация и статистика
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalPositions, setTotalPositions] = React.useState(0);
  const [totalValue, setTotalValue] = React.useState(0);

  // Поля формы
  const [name, setName] = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [price, setPrice] = React.useState('');

  // Загрузка списка (с учётом страницы)
  async function loadProducts(currentPage = page) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}?page=${currentPage}`);
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);
      const data = await res.json();
      setItems(data.items);
      setTotalPages(data.totalPages);
      setTotalPositions(data.totalPositions);
      setTotalValue(data.totalValue);
      setPage(data.page);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadProducts(1);
  }, []);

  // Создание
  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    // Валидация на клиенте
    const qty = Number(quantity);
    const prc = Number(price);
    if (!Number.isInteger(qty) || qty < 0) {
      setError('Количество должно быть целым неотрицательным числом');
      return;
    }
    if (isNaN(prc) || prc < 0) {
      setError('Цена должна быть положительным числом');
      return;
    }

    const body = { name: name.trim(), quantity: qty, price: prc };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Ошибка ${res.status}`);
      }
      resetForm();
      await loadProducts(1); // сбрасываем на первую страницу после создания
    } catch (e) {
      setError(e.message);
    }
  }

  // Удаление
  async function handleDelete(id) {
    if (!window.confirm('Удалить этот товар?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);
      // Если удалили последний элемент на странице, переходим на предыдущую
      const newPage = items.length === 1 && page > 1 ? page - 1 : page;
      await loadProducts(newPage);
    } catch (e) {
      setError(e.message);
    }
  }

  function resetForm() {
    setName('');
    setQuantity('');
    setPrice('');
  }

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Склад товаров</h1>

      {error && (
        <p style={{ color: 'white', background: '#c00', padding: '0.5rem' }}>
          {error}
        </p>
      )}

      {/* Форма добавления */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input placeholder="Название" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Количество" type="number" min="0" step="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        <input placeholder="Цена" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <button type="submit">Добавить</button>
      </form>

      {/* Статистика */}
      <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: 4 }}>
        <strong>Всего позиций:</strong> {totalPositions} | <strong>Суммарная стоимость:</strong> {totalValue.toLocaleString('ru-RU')} ₽
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : items.length === 0 ? (
        <p>Список пуст. Добавьте первый товар.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Количество</th>
              <th>Цена</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.quantity}</td>
                <td>{p.price} ₽</td>
                <td>
                  <button onClick={() => handleDelete(p.id)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Пагинация */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1rem' }}>
          <button disabled={page === 1} onClick={() => loadProducts(page - 1)}>Назад</button>
          <span>Страница {page} из {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => loadProducts(page + 1)}>Вперёд</button>
        </div>
      )}
    </div>
  );
}