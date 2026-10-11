
import { useCallback, useEffect, useState } from 'react'



function App() {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    amount: '',
    type: 'EXPENSE',
    category: '',
    description: '',
    date: new Date().toLocaleDateString('en-CA'),
  })

  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'INCOME')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'EXPENSE')
    .reduce((total, transaction) => total + Number(transaction.amount), 0)

  const balance = totalIncome - totalExpenses

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesType =
      filter === 'ALL' || transaction.type === filter

    const query = searchTerm.trim().toLowerCase()

    const matchesSearch =
      transaction.category.toLowerCase().includes(query) ||
      (transaction.description || '').toLowerCase().includes(query)

    return matchesType && matchesSearch
  })


  const loadTransactions = useCallback(async () => {
    try {
      setError('')
      const response = await fetch('/api/transactions')

      if (!response.ok) {
        throw new Error('Could not load transactions.')
      }

      const data = await response.json()
      setTransactions(data)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (!form.category.trim()) {
      setFormError('Please enter a category.')
      return
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setFormError('Amount must be greater than zero.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
  editingId !== null
    ? `/api/transactions/${editingId}`
    : '/api/transactions',
  {
    method: editingId !== null ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          category: form.category.trim(),
          description: form.description.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Could not save transaction.')
      }

      setForm({
        amount: '',
        type: 'EXPENSE',
        category: '',
        description: '',
        date: new Date().toLocaleDateString('en-CA'),
      })

      setEditingId(null)

      await loadTransactions()
    } catch (err) {
      setFormError(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }
  
async function handleDelete(id) {
  const confirmed = window.confirm(
    'Are you sure you want to delete this transaction?'
  )

  if (!confirmed) return

  try {
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Could not delete transaction.')
    }

    await loadTransactions()
  } catch (err) {
    setError(err.message || 'Something went wrong.')
  }
}


function handleEdit(transaction) {
  setEditingId(transaction.id)

  setForm({
    amount: String(transaction.amount),
    type: transaction.type,
    category: transaction.category,
    description: transaction.description || '',
    date: transaction.date,
  })

  setFormError('')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}


  return (
    <main>
      <h1>Expense Tracker</h1>
      <p>Track your income and expenses in one place.</p>


<section className="summary-grid">
  <div className="summary-card income-card">
    <p>Total Income</p>
    <h2>{formatCurrency(totalIncome)}</h2>
  </div>

  <div className="summary-card expense-card">
    <p>Total Expenses</p>
    <h2>{formatCurrency(totalExpenses)}</h2>
  </div>

  <div className="summary-card balance-card">
    <p>Balance</p>
    <h2>{formatCurrency(balance)}</h2>
  </div>
</section>


      <section>
        <h2>Add Transaction</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="amount">Amount (₹)</label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="type">Type</label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
          </div>

          <div>
            <label htmlFor="category">Category</label>
            <input
              id="category"
              name="category"
              type="text"
              maxLength="50"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Food, Salary"
              required
            />
          </div>

          <div>
            <label htmlFor="description">Description (optional)</label>
            <input
              id="description"
              name="description"
              type="text"
              maxLength="255"
              value={form.description}
              onChange={handleChange}
              placeholder="What was this transaction for?"
            />
          </div>

          <div>
            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          {formError && <p role="alert">{formError}</p>}

          <button type="submit" disabled={saving}>
            {saving
  ? 'Saving...'
  : editingId !== null
    ? 'Update Transaction'
    : 'Add Transaction'}
          </button>
        </form>
      </section>

      <section>
        <h2>Transactions</h2>

        
<div className="transaction-filters">
  
<input
  type="search"
  className="transaction-search"
  placeholder="Search by category or description..."
  value={searchTerm}
  onChange={(event) => setSearchTerm(event.target.value)}
  aria-label="Search transactions"
/>

  <button
    type="button"
    className={filter === 'ALL' ? 'filter-button active' : 'filter-button'}
    onClick={() => setFilter('ALL')}
  >
    All
  </button>

  <button
    type="button"
    className={filter === 'INCOME' ? 'filter-button active' : 'filter-button'}
    onClick={() => setFilter('INCOME')}
  >
    Income
  </button>

  <button
    type="button"
    className={filter === 'EXPENSE' ? 'filter-button active' : 'filter-button'}
    onClick={() => setFilter('EXPENSE')}
  >
    Expenses
  </button>
</div>


        {loading && <p>Loading transactions...</p>}
        {error && <p role="alert">Error: {error}</p>}

        {!loading && !error && transactions.length === 0 && (
          <p>No transactions yet. Add your first transaction above.</p>
        )}

        {!loading && !error && transactions.length > 0 && (
          <ul>
            
{filteredTransactions.map((transaction) => (
  <li key={transaction.id} className="transaction-item">
    <div className="transaction-details">
      <strong>{transaction.category}</strong>
      <span>{transaction.date}</span>
      {transaction.description && (
        <span>{transaction.description}</span>
      )}
      <span className={transaction.type === 'INCOME' ? 'income-text' : 'expense-text'}>
        {transaction.type}
      </span>
      <span className="transaction-amount">
  {formatCurrency(Number(transaction.amount))}
</span>
    </div>

    
<div className="transaction-actions">
  <button
    className="edit-button"
    onClick={() => handleEdit(transaction)}
  >
    Edit
  </button>

  <button
    className="delete-button"
    onClick={() => handleDelete(transaction.id)}
  >
    Delete
  </button>
</div>

  </li>
))}

          </ul>
        )}
      </section>
    </main>
  )
}

export default App
