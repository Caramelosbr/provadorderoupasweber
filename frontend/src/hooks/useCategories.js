import { useQuery } from 'react-query'
import { categoryService } from '../services/categoryService'

export const useCategories = (params) => {
  return useQuery(['categories', params], () => categoryService.getAll(params))
}

export const useCategoryTree = () => {
  return useQuery('categoryTree', categoryService.getTree)
}

export const useCategory = (slug) => {
  return useQuery(['category', slug], () => categoryService.getBySlug(slug), {
    enabled: !!slug
  })
}
