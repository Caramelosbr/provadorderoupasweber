import { useQuery, useMutation, useQueryClient } from 'react-query'
import { productService } from '../services/productService'

export const useProducts = (params) => {
  return useQuery(['products', params], () => productService.getAll(params), {
    keepPreviousData: true
  })
}

export const useProduct = (slug) => {
  return useQuery(['product', slug], () => productService.getBySlug(slug), {
    enabled: !!slug
  })
}

export const useRelatedProducts = (id) => {
  return useQuery(['relatedProducts', id], () => productService.getRelated(id), {
    enabled: !!id
  })
}

export const useMyProducts = (params) => {
  return useQuery(['myProducts', params], () => productService.getMyProducts(params))
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation(productService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('myProducts')
    }
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  return useMutation(
    ({ id, data }) => productService.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myProducts')
        queryClient.invalidateQueries('product')
      }
    }
  )
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  return useMutation(productService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('myProducts')
    }
  })
}
