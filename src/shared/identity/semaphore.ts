import { Identity } from '@semaphore-protocol/identity'
import { generateProof } from '@semaphore-protocol/proof'
import { Group } from '@semaphore-protocol/group'
import { utils, BigNumber } from 'ethers'
import type { ActivationProof } from '@/shared/identity/allocateIdentity'

function createIdentity(userSecret: string, label: string): Identity {
  const identitySecret = utils.keccak256(
    utils.solidityPack(['bytes32', 'string'], [userSecret, label]),
  )
  return new Identity(identitySecret)
}

export async function generateActivationProof(
  userSecret: string,
  label: string,
  commitments: string[],
  scope: string,
  expectedMerkleTreeRoot?: string,
): Promise<ActivationProof> {
  const identity = createIdentity(userSecret, label)
  const group = new Group()
  for (const commitment of commitments) {
    group.addMember(BigInt(commitment))
  }

  if (group.indexOf(identity.commitment) === -1) {
    throw new Error('Activation secret does not match the current claim group')
  }

  const groupRoot = group.root.toString()
  if (expectedMerkleTreeRoot && groupRoot !== expectedMerkleTreeRoot) {
    throw new Error(
      `Claim group root mismatch. Client root ${groupRoot} does not match chain root ${expectedMerkleTreeRoot}`,
    )
  }

  const message = BigNumber.from(utils.formatBytes32String(label)).toString()
  const proof = await generateProof(identity, group, message, scope)

  return {
    merkleTreeDepth: proof.merkleTreeDepth,
    merkleTreeRoot: String(proof.merkleTreeRoot),
    nullifier: String(proof.nullifier),
    message: String(proof.message),
    scope: String(proof.scope),
    points: proof.points.map(String),
  }
}
