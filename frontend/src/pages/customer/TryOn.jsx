// Página do Provador Virtual
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProduct } from '../../hooks/useProducts'
import { useCreateTryOn, useCreateTryOnWithPhoto, useTryOn } from '../../hooks/useTryOn'
import toast from 'react-hot-toast'

export default function TryOn() {
  const { productId } = useParams()
  const { data: productData } = useProduct(productId)
  const product = productData?.data?.product

  const createTryOn = useCreateTryOn()
  const createTryOnWithPhoto = useCreateTryOnWithPhoto()

  const [tryOnId, setTryOnId] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [uploadedPhoto, setUploadedPhoto] = useState(null)

  const { data: tryOnData } = useTryOn(tryOnId)
  const tryOnResult = tryOnData?.data?.tryOn

  const handleTryOn = async () => {
    try {
      let result
      
      if (uploadedPhoto) {
        const formData = new FormData()
        formData.append('photo', uploadedPhoto)
        formData.append('productId', productId)
        formData.append('variant', JSON.stringify({ size: selectedSize, color: selectedColor }))
        result = await createTryOnWithPhoto.mutateAsync(formData)
      } else {
        result = await createTryOn.mutateAsync({
          productId,
          variant: { size: selectedSize, color: selectedColor }
        })
      }

      setTryOnId(result.data.tryOn.id)
      toast.success('Prova virtual iniciada!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao iniciar prova virtual')
    }
  }

  return (
    <div>
      <h1>Provador Virtual</h1>

      <div>
        {/* Imagem do produto */}
        <div>
          <img src={product?.images?.[0]?.url} alt={product?.name} />
        </div>

        {/* Configurações */}
        <div>
          <h2>{product?.name}</h2>

          {/* Seleção de tamanho */}
          <div>
            <label>Tamanho:</label>
            {/* Botões de tamanho */}
          </div>

          {/* Seleção de cor */}
          <div>
            <label>Cor:</label>
            {/* Botões de cor */}
          </div>

          {/* Upload de foto */}
          <div>
            <label>Sua foto (opcional - ou use a foto salva no perfil):</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setUploadedPhoto(e.target.files[0])} 
            />
          </div>

          <button onClick={handleTryOn} disabled={createTryOn.isLoading}>
            {createTryOn.isLoading ? 'Processando...' : 'Experimentar'}
          </button>
        </div>
      </div>

      {/* Resultado */}
      {tryOnResult && (
        <div>
          <h2>Resultado</h2>
          {tryOnResult.status === 'processing' && <p>Processando...</p>}
          {tryOnResult.status === 'completed' && (
            <img src={tryOnResult.resultImage?.url} alt="Resultado" />
          )}
          {tryOnResult.status === 'failed' && <p>Erro ao processar. Tente novamente.</p>}
        </div>
      )}
    </div>
  )
}