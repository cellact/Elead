import type { ClientIdentity } from '@/shared/identity/types'

/**
 * Allots a pre-generated ENS to this visit.
 * Replace this body with the real backend call when it exists.
 */
export async function allocateIdentity(): Promise<ClientIdentity> {
  const token = crypto.randomUUID()
  const short = token.slice(0, 8)

  if (short.length === 0) {
    throw new Error('Could not allot a private line. Reload and try again.')
  }

  const ensName = `lead-${short}.elead.eth`
  const activationUrl = `https://arnacon.app/activate?ens=${encodeURIComponent(ensName)}`

  return { ensName, activationUrl }
}
