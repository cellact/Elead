import type { EleadIdentity } from '@/shared/identity/types'

const identityKind = {
  lead: 'lead',
  inbox: 'inbox',
} as const

export type IdentityKind = (typeof identityKind)[keyof typeof identityKind]

/**
 * Allots a pre-generated ENS.
 * Replace this body with the real backend call when it exists.
 */
export async function allocateIdentity(
  kind: IdentityKind = identityKind.lead,
): Promise<EleadIdentity> {
  const token = crypto.randomUUID()
  const short = token.slice(0, 8)

  if (short.length === 0) {
    throw new Error('Could not allot a private line. Reload and try again.')
  }

  const ensName = `${kind}-${short}.elead.eth`
  const activationUrl = `https://arnacon.app/activate?ens=${encodeURIComponent(ensName)}`

  return { ensName, activationUrl }
}
