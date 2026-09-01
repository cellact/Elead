import { useContext } from 'react'
import {
  ProviderStudioContext,
  type ProviderStudioValue,
} from '@/shared/provider/studio-context'

export function useProviderStudio(): ProviderStudioValue {
  const value = useContext(ProviderStudioContext)

  if (!value) {
    throw new Error(
      'useProviderStudio must be used inside ProviderStudioProvider.',
    )
  }

  return value
}
