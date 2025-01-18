import { useState, useEffect } from 'react'
import { 
  Button, Field, Input, Textarea
} from '@fluentui/react-components'
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
        
      <Field label="Title"  required> 
        <Input value={formData.title} 
          onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
      </Field>
      
    <Field label="Description">
      <Textarea  
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}/>
    </Field>
        
        <Button type="submit" 
           shape="square" appearance="primary">
          {editingId ? 'Mettre à jour' : 'Ajouter'} Item
        </Button>
      </form>

      <div className="items">
        {items.map(item => (
          <div key={item.id} className="item">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="actions">
              
        <Button 
           shape="square"
          onClick={() => handleEdit(item)}>
          Modifier
        </Button>
        
      <Button 
           shape="square" onClick={() => handleDelete(item.id)}>Supprimer</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
