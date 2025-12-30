import { useQuery, useMutation, useQueryClient } from 'react-query'
import { orderService } from '../services/orderService'

export const useOrders = (params) => {
  return useQuery(['orders', params], () => orderService.getAll(params))
}

export const useOrder = (id) => {
  return useQuery(['order', id], () => orderService.getById(id), {
    enabled: !!id
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  return useMutation(orderService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('orders')
    }
  })
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient()
  return useMutation(
    ({ id, reason }) => orderService.cancel(id, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders')
        queryClient.invalidateQueries('order')
      }
    }
  )
}

// Vendedor
export const useStoreOrders = (params) => {
  return useQuery(['storeOrders', params], () => orderService.getStoreOrders(params))
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()
  return useMutation(
    ({ id, data }) => orderService.updateStatus(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('storeOrders')
        queryClient.invalidateQueries('order')
      }
    }
  )
}
