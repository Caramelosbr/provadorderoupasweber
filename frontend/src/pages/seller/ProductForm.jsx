// Formulário de Produto (Criar/Editar)
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../../services/productService'
import { useCreateProduct, useUpdateProduct } from '../../hooks/useProducts'
import toast from 'react-hot-toast'

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    variants: [],
    attributes: {}
  })

  useEffect(() => {
    if (isEditing) {
      // Carregar dados do produto
      productService.getById(id).then(({ data }) => {
        setFormData(data.product)
      })
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id, data: formData })
        toast.success('Produto atualizado!')
      } else {
        await createProduct.mutateAsync(formData)
        toast.success('Produto criado!')
      }
      navigate('/vendedor/produtos')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar produto')
    }
  }

  return (
    <div>
      <h1>{isEditing ? 'Editar Produto' : 'Novo Produto'}</h1>
      
      <form onSubmit={handleSubmit}>
        {/* Nome */}
        <div>
          <label>Nome</label>
          <input 
            type="text" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
          />
        </div>

        {/* Descrição */}
        <div>
          <label>Descrição</label>
          <textarea 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
          />
        </div>

        {/* Preço */}
        <div>
          <label>Preço</label>
          <input 
            type="number" 
            value={formData.price} 
            onChange={(e) => setFormData({...formData, price: e.target.value})} 
          />
        </div>

        {/* Categoria */}
        <div>
          <label>Categoria</label>
          {/* Select de categorias */}
        </div>

        {/* Variações (tamanhos e cores) */}
        <div>
          <label>Variações</label>
          {/* Componente para gerenciar variações */}
        </div>

        {/* Upload de imagens */}
        <div>
          <label>Imagens</label>
          {/* Componente de upload */}
        </div>

        {/* Imagem para provador virtual */}
        <div>
          <label>Imagem para Provador Virtual</label>
          {/* Upload especial */}
        </div>

        <button type="submit">
          {isEditing ? 'Atualizar' : 'Criar'}
        </button>
      </form>
    </div>
  )
}
