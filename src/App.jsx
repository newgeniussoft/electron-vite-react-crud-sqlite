import { useState, useEffect } from 'react'
import './App.css'

const { ipcRenderer } = window.require('electron')

function App() {
  const [items, setItems] = useState([])
  const [formData, setFormData] = useState({ title: '', description: '' })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    loadItems()
  }, [])

  const loadItems = async () => {
    const items = await ipcRenderer.invoke('read-items')
    setItems(items)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (editingId) {
      await ipcRenderer.invoke('update-item', { ...formData, id: editingId })
      setEditingId(null)
    } else {
      await ipcRenderer.invoke('create-item', formData)
    }
    
    setFormData({ title: '', description: '' })
    loadItems()
  }

  const handleDelete = async (id) => {
    await ipcRenderer.invoke('delete-item', id)
    loadItems()
  }

  const handleEdit = (item) => {
    setFormData({ title: item.title, description: item.description })
    setEditingId(item.id)
  }

  return (
    <div className="container">
      <h1>CRUD Application</h1>
      
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
        <button type="submit">
          {editingId ? 'Update' : 'Add'} Item
        </button>
      </form>

      <div className="items">
        {items.map(item => (
          <div key={item.id} className="item">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="actions">
              <button onClick={() => handleEdit(item)}>Modifier</button>
              <button onClick={() => handleDelete(item.id)}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
