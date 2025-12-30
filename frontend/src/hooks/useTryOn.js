import { useQuery, useMutation, useQueryClient } from 'react-query'
import { tryonService } from '../services/tryonService'

export const useTryOn = (id) => {
  return useQuery(['tryon', id], () => tryonService.getById(id), {
    enabled: !!id,
    refetchInterval: (data) => {
      // Refetch enquanto estiver processando
      if (data?.data?.tryOn?.status === 'processing' || data?.data?.tryOn?.status === 'pending') {
        return 2000
      }
      return false
    }
  })
}

export const useMyTryOns = (params) => {
  return useQuery(['myTryOns', params], () => tryonService.getMyTryOns(params))
}

export const useCreateTryOn = () => {
  const queryClient = useQueryClient()
  return useMutation(tryonService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('myTryOns')
    }
  })
}

export const useCreateTryOnWithPhoto = () => {
  const queryClient = useQueryClient()
  return useMutation(tryonService.createWithPhoto, {
    onSuccess: () => {
      queryClient.invalidateQueries('myTryOns')
    }
  })
}

export const useSaveTryOn = () => {
  const queryClient = useQueryClient()
  return useMutation(tryonService.save, {
    onSuccess: () => {
      queryClient.invalidateQueries('myTryOns')
    }
  })
}

export const useTryOnFeedback = () => {
  return useMutation(({ id, data }) => tryonService.sendFeedback(id, data))
}

export const useDeleteTryOn = () => {
  const queryClient = useQueryClient()
  return useMutation(tryonService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('myTryOns')
    }
  })
}

export const useStoreTryOnStats = () => {
  return useQuery('storeTryOnStats', tryonService.getStoreStats)
}
