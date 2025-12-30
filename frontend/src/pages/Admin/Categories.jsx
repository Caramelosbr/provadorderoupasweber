// Gerenciamento de Categorias (Admin)
import { useState } from 'react'
import { useCategoryTree } from '../../hooks/useCategories'
import { categoryService } from '../../services/categoryService'
import toast from 'react-hot-toast'

export default function Categories() {
  const { data, isLoading, refetch } = useCategoryTree()
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const handleSave = async (formData) => {
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory._id, formData)
        toast.success('Categoria atualizada!')
      } else {
        await categoryService.create(formData)
        toast.success('Categoria criada!')
      }
      setShowModal(false)
      setEditingCategory(null)
      refetch()
    } catch (error) {
      toast.error('Erro ao salvar categoria')
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Tem certeza?')) {
      try {
        await categoryService.delete(id)
        toast.success('Categoria removida!')
        refetch()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao remover')
      }
    }
  }

  if (isLoading) return <div>Carregando...</div>

  return (
    <div>
      <h1>Categorias</h1>
      
      <button onClick={() => setShowModal(true)}>Nova Categoria</button>

      {/* Árvore de categorias */}
      <div>
        {data?.data?.categories?.map(category => (
          <div key={category._id}>
            <span>{category.name}</span>
            <button onClick={() => { setEditingCategory(category); setShowModal(true) }}>Editar</button>
            <button onClick={() => handleDelete(category._id)}>Excluir</button>
            
            {/* Subcategorias */}
            {category.subcategories?.map(sub => (
              <div key={sub._id} style={{ marginLeft: 20 }}>
                <span>{sub.name}</span>
                <button onClick={() => { setEditingCategory(sub); setShowModal(true) }}>Editar</button>
                <button onClick={() => handleDelete(sub._id)}>Excluir</button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Modal de Categoria */}
      {showModal && (
        <div>
          {/* Formulário de categoria */}
          {/* Nome, Slug, Descrição, Imagem, Categoria Pai, Tipo TryOn */}
        </div>
      )}
    </div>
  )
}