import { useEffect, useRef, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract, ContractFactory } from '@ethersproject/contracts'
import { AddressZero } from '@ethersproject/constants'
import { id, namehash } from '@ethersproject/hash'
import { fetchLinkedDomain, linkDomain } from '@/shared/identity/allocateIdentity'
import { Page } from '@/shared/layout/Page/Page'
import { isValidationError } from '@/shared/lib/errors'
import { connectConsoleWallet, type ConsoleWallet } from '@/pages/ProviderAuthPage'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'
import { requireDomain } from '@/shared/provider/validate'
import { Button } from '@/shared/ui/Button/Button'
import { Card } from '@/shared/ui/Card/Card'
import { actionSize, actionVariant } from '@/shared/ui/action/action'
import { Cluster } from '@/shared/ui/Cluster/Cluster'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Field } from '@/shared/ui/Field/Field'
import { Heading } from '@/shared/ui/Heading/Heading'
import { Input } from '@/shared/ui/Input/Input'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'
import styles from '@/pages/ProviderSetupPage.module.css'

const ABI = {
  grc: [
    'function get2LDControllerFor(address) view returns (address)',
    'function PRICE() view returns (uint256)',
    'function deploy2LDController(address secondLevelInteractor) payable',
    'function register(string name, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint16 ownerControlledFuses) payable',
  ],
  eth: [
    'function available(string name) view returns (bool)',
    'function rentPrice(string name, uint256 duration) view returns (tuple(uint256 base, uint256 premium) price)',
    'function makeCommitment(string name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint16 ownerControlledFuses) pure returns (bytes32)',
    'function commitments(bytes32) view returns (uint256)',
    'function commit(bytes32 commitment)',
    'function minCommitmentAge() view returns (uint256)',
  ],
  slc: [
    'function getSecondLevelInteractor() view returns (address)',
    'function setSecondLevelInteractor(address)',
    'function setText(bytes32 node, string key, string value)',
  ],
  sli: [
    'function makeController(address newController)',
    'function arnaconResolver() view returns (address)',
    'function setArnaconResolver(address)',
    'function setSecondLevelController(address)',
    'function grantRole(bytes32 role, address account)',
    'function hasRole(bytes32 role, address account) view returns (bool)',
  ],
  resolver: [
    'function text(bytes32 node, string key) view returns (string)',
  ],
  registry: ['function owner(bytes32 node) view returns (address)'],
  wrapper: ['function ownerOf(uint256 id) view returns (address)'],
} as const

const setupWork = {
  domain: 'domain',
  attach: 'attach',
  inbox: 'inbox',
} as const

type SetupWork = (typeof setupWork)[keyof typeof setupWork]

const steps = [
  {
    number: '01',
    title: 'Open Arnacon',
    copy: 'Open Arnacon on the phone that will hold the console inbox.',
  },
  {
    number: '02',
    title: 'Scan this QR code',
    copy: 'Use Scan in the app and point it at the square.',
  },
  {
    number: '03',
    title: 'Activate the inbox',
    copy: 'Turn on this identity. Client leads arrive here.',
  },
] as const

function requireContract(
  contracts: Record<string, string>,
  name: string,
): string {
  const address = contracts[name]
  if (!address) {
    throw new Error(`missing contract ${name} in /config`)
  }
  return address
}

export async function get2ld(wallet: ConsoleWallet): Promise<string> {
  const grc = new Contract(
    requireContract(wallet.config.contracts, 'GlobalRegistrarController'),
    ABI.grc,
    wallet.signer,
  )
  return grc.get2LDControllerFor(wallet.address) as Promise<string>
}

const SI_TEXT_KEY = 'semaphoreInteractor'

async function readSemaphoreInteractorText(
  wallet: ConsoleWallet,
  label: string,
): Promise<string | null> {
  const resolverAddr = wallet.config.contracts.PublicResolver
  if (!resolverAddr) return null
  const resolver = new Contract(resolverAddr, ABI.resolver, wallet.signer)
  const raw = (await resolver.text(
    namehash(`${label}.global`),
    SI_TEXT_KEY,
  )) as string
  const value = String(raw || '').trim()
  if (!value || value.toLowerCase() === AddressZero.toLowerCase()) {
    return null
  }
  return value
}

async function publishSemaphoreInteractorText(
  wallet: ConsoleWallet,
  label: string,
  si: string,
): Promise<void> {
  const current = await readSemaphoreInteractorText(wallet, label)
  if (current && current.toLowerCase() === si.toLowerCase()) {
    return
  }
  const slcAddr = await get2ld(wallet)
  const slc = new Contract(slcAddr, ABI.slc, wallet.signer)
  const tx = await slc.setText(namehash(`${label}.global`), SI_TEXT_KEY, si)
  await waitTx('setText semaphoreInteractor', tx)
}

export async function resolveNameOwner(
  wallet: ConsoleWallet,
  label: string,
): Promise<string | null> {
  const registryAddr = wallet.config.contracts.ENSRegistry
  if (!registryAddr) return null
  const node = namehash(`${label}.global`)
  const registry = new Contract(registryAddr, ABI.registry, wallet.signer)
  let owner = (await registry.owner(node)) as string
  if (!owner || owner.toLowerCase() === AddressZero.toLowerCase()) {
    return null
  }
  const wrapperAddr = wallet.config.contracts.NameWrapper
  if (wrapperAddr && owner.toLowerCase() === wrapperAddr.toLowerCase()) {
    const wrapper = new Contract(wrapperAddr, ABI.wrapper, wallet.signer)
    try {
      owner = (await wrapper.ownerOf(BigNumber.from(node))) as string
    } catch {
      return owner
    }
  }
  if (!owner || owner.toLowerCase() === AddressZero.toLowerCase()) {
    return null
  }
  return owner
}

export function sameAddr(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false
  if (a.toLowerCase() === AddressZero.toLowerCase()) return false
  return a.toLowerCase() === b.toLowerCase()
}

const SEPOLIA_SEMAPHORE_VERIFIER = '0xd66efA909cA5161BFDCE39058f61b3c6186263B7'

type LinkReferences = Record<
  string,
  Record<string, { start: number; length: number }[]>
>

function logAegis(event: string, extra?: unknown) {
  if (extra !== undefined) {
    console.log(`[aegis] ${event}`, extra)
  } else {
    console.log(`[aegis] ${event}`)
  }
  const line =
    extra === undefined
      ? event
      : `${event} ${(() => {
          try {
            return JSON.stringify(extra)
          } catch {
            return String(extra)
          }
        })()}`
  txLogSink?.(line)
}

let txLogSink: ((line: string) => void) | null = null

async function waitTx(
  label: string,
  tx: {
    hash: string
    nonce?: number
    gasLimit?: { toString: () => string }
    wait: () => Promise<{
      transactionHash?: string
      status?: number
      contractAddress?: string
      gasUsed?: { toString: () => string }
      blockNumber?: number
    }>
  },
) {
  logAegis(`sent ${label}`, {
    hash: tx.hash,
    nonce: tx.nonce,
    gasLimit: tx.gasLimit?.toString?.(),
  })
  const receipt = await tx.wait()
  logAegis(`mined ${label}`, {
    hash: receipt.transactionHash || tx.hash,
    status: receipt.status,
    contractAddress: receipt.contractAddress,
    gasUsed: receipt.gasUsed?.toString?.(),
    blockNumber: receipt.blockNumber,
  })
  if (receipt.status === 0) {
    throw new Error(`${label} reverted (${tx.hash})`)
  }
  return receipt
}

function linkLibraries(
  bytecode: string,
  linkReferences: LinkReferences | undefined,
  libraries: Record<string, string>,
): string {
  let linked = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode
  for (const fileRefs of Object.values(linkReferences || {})) {
    for (const [lib, spots] of Object.entries(fileRefs)) {
      const addr = libraries[lib]
      if (!addr) {
        throw new Error(`missing library ${lib}`)
      }
      const hex = addr.toLowerCase().replace(/^0x/, '').padStart(40, '0')
      for (const { start, length } of spots) {
        const startHex = start * 2
        const lengthHex = length * 2
        linked =
          linked.slice(0, startHex) + hex + linked.slice(startHex + lengthHex)
      }
    }
  }
  const poseidon = libraries.PoseidonT3
  if (poseidon) {
    const hex = poseidon.toLowerCase().replace(/^0x/, '').padStart(40, '0')
    linked = linked.replace(/__\$[a-fA-F0-9]{34}\$__/g, hex)
  }
  if (/[^0-9a-fA-F]/.test(linked)) {
    throw new Error('SemaphoreInteractor bytecode still has library placeholders')
  }
  return `0x${linked}`
}

async function hasCode(
  wallet: ConsoleWallet,
  addr: string | null | undefined,
): Promise<boolean> {
  if (!addr || addr.toLowerCase() === AddressZero.toLowerCase()) return false
  const code = await wallet.provider.getCode(addr)
  return Boolean(code) && code !== '0x'
}

async function deployWithGas(
  wallet: ConsoleWallet,
  label: string,
  abi: string[],
  bytecode: string,
  args: unknown[],
  gasLimit: number,
): Promise<string> {
  logAegis(`deploy start ${label}`, {
    bytecodeBytes: Math.max(0, (bytecode.length - 2) / 2),
    args,
    gasLimit,
  })
  const factory = new ContractFactory(abi, bytecode, wallet.signer)
  const overrides = { gasLimit: BigNumber.from(gasLimit) }
  const contract =
    args.length > 0
      ? await factory.deploy(...args, overrides)
      : await factory.deploy(overrides)
  await waitTx(label, contract.deployTransaction)
  await contract.deployed()
  logAegis(`deploy ok ${label}`, { address: contract.address })
  return contract.address
}

async function deployPoseidonT3(wallet: ConsoleWallet): Promise<string> {
  const existing = wallet.config.contracts.PoseidonT3
  const exists = await hasCode(wallet, existing)
  logAegis('poseidon check', { existing: existing || null, hasCode: exists })
  if (exists) {
    logAegis('poseidon skip, already on chain', existing)
    return existing
  }
  const bytecode = wallet.config.artifacts.PoseidonT3?.bytecode
  if (!bytecode) {
    throw new Error('backend /config missing PoseidonT3 bytecode — redeploy elead-backend')
  }
  const addr = await deployWithGas(
    wallet,
    'PoseidonT3',
    [],
    bytecode,
    [],
    12_000_000,
  )
  wallet.config.contracts.PoseidonT3 = addr
  return addr
}

async function deploySemaphoreInteractor(
  wallet: ConsoleWallet,
  sliAddr: string,
): Promise<string> {
  const siArt = wallet.config.artifacts.SemaphoreInteractor
  logAegis('group artifacts', {
    hasBytecode: Boolean(siArt?.bytecode),
    linkFiles: siArt?.linkReferences
      ? Object.keys(siArt.linkReferences)
      : [],
    poseidon: wallet.config.contracts.PoseidonT3 || null,
    verifier: wallet.config.contracts.SemaphoreVerifier || null,
    sli: sliAddr,
  })
  if (!siArt?.bytecode) {
    throw new Error(
      'backend /config missing SemaphoreInteractor bytecode — redeploy elead-backend',
    )
  }
  const poseidonAddr = wallet.config.contracts.PoseidonT3
  if (!(await hasCode(wallet, poseidonAddr))) {
    throw new Error('PoseidonT3 is not on chain. Run the Poseidon step first.')
  }
  const linked = linkLibraries(siArt.bytecode, siArt.linkReferences, {
    PoseidonT3: poseidonAddr,
  })
  const verifier =
    wallet.config.contracts.SemaphoreVerifier ||
    (wallet.config.chainId === 11155111 ? SEPOLIA_SEMAPHORE_VERIFIER : '')
  if (!verifier) {
    throw new Error('no SemaphoreVerifier in /config')
  }
  return deployWithGas(
    wallet,
    'SemaphoreInteractor',
    ['constructor(address,address)'],
    linked,
    [verifier, sliAddr],
    12_000_000,
  )
}

async function registerAsDomainOwner(wallet: ConsoleWallet): Promise<void> {
  const existing = await get2ld(wallet)
  if (existing && existing.toLowerCase() !== AddressZero.toLowerCase()) {
    return
  }

  const artifacts = wallet.config.artifacts
  if (!artifacts.SecondLevelInteractor?.bytecode || !artifacts.ArnaconResolver?.bytecode) {
    throw new Error('backend /config missing deploy artifacts')
  }

  const c = wallet.config.contracts
  const interactorFactory = new ContractFactory(
    ['constructor(address,address,address,address,address,address)', ...ABI.sli],
    artifacts.SecondLevelInteractor.bytecode,
    wallet.signer,
  )
  const interactor = await interactorFactory.deploy(
    requireContract(c, 'GlobalRegistrarController'),
    requireContract(c, 'NameWrapper'),
    AddressZero,
    requireContract(c, 'PublicResolver'),
    requireContract(c, 'SignatureVerifier'),
    requireContract(c, 'ProvisionRegistry'),
  )
  await waitTx('SecondLevelInteractor', interactor.deployTransaction)
  await interactor.deployed()

  const resolverFactory = new ContractFactory(
    ['constructor(address)'],
    artifacts.ArnaconResolver.bytecode,
    wallet.signer,
  )
  const resolver = await resolverFactory.deploy(interactor.address)
  await waitTx('ArnaconResolver', resolver.deployTransaction)
  await resolver.deployed()

  const currentResolver = (await interactor.arnaconResolver()) as string
  if (currentResolver.toLowerCase() !== resolver.address.toLowerCase()) {
    const tx = await interactor.setArnaconResolver(resolver.address)
    await waitTx('setArnaconResolver', tx)
  }

  const grc = new Contract(
    requireContract(c, 'GlobalRegistrarController'),
    ABI.grc,
    wallet.signer,
  )
  const price = await grc.PRICE()
  const deployTx = await grc.deploy2LDController(interactor.address, {
    value: price,
  })
  await waitTx('deploy2LDController', deployTx)
  const slcAddr = await get2ld(wallet)

  const slc = new Contract(slcAddr, ABI.slc, wallet.signer)
  const interactorInController = (await slc.getSecondLevelInteractor()) as string
  if (interactorInController.toLowerCase() !== interactor.address.toLowerCase()) {
    const t1 = await interactor.setSecondLevelController(slcAddr)
    await waitTx('setSecondLevelController', t1)
    const t2 = await slc.setSecondLevelInteractor(interactor.address)
    await waitTx('setSecondLevelInteractor', t2)
  }
}

async function purchaseName(wallet: ConsoleWallet, name: string): Promise<void> {
  const slcAddr = await get2ld(wallet)
  if (!slcAddr || slcAddr.toLowerCase() === AddressZero.toLowerCase()) {
    throw new Error('no 2LD controller after registerAsDomainOwner')
  }

  const owner = await resolveNameOwner(wallet, name)
  if (sameAddr(owner, slcAddr)) {
    return
  }
  if (owner) {
    throw new Error(
      `${name}.global is already owned by ${owner}, not your 2LD controller ${slcAddr}.`,
    )
  }

  const duration = 365 * 24 * 60 * 60
  const secret = id('secret')
  const resolver = requireContract(wallet.config.contracts, 'PublicResolver')
  const data: string[] = []
  const reverseRecord = false
  const ownerControlledFuses = 0

  const eth = new Contract(
    requireContract(wallet.config.contracts, 'ETHRegistrarController'),
    ABI.eth,
    wallet.signer,
  )
  const grc = new Contract(
    requireContract(wallet.config.contracts, 'GlobalRegistrarController'),
    ABI.grc,
    wallet.signer,
  )

  const price = await eth.rentPrice(name, duration)
  const totalPrice = price.base.add(price.premium)

  const tx = await grc.register(
    name,
    duration,
    secret,
    resolver,
    data,
    reverseRecord,
    ownerControlledFuses,
    { value: totalPrice },
  )
  await waitTx('register', tx)
}

const onboardIds = [
  'connect',
  'deploy2ld',
  'commit',
  'waitCommit',
  'register',
  'makeController',
  'linkBackend',
  'poseidon',
  'ensureSemaphore',
  'grantSemaphore',
  'publishSemaphore',
] as const

type OnboardId = (typeof onboardIds)[number]
type StepStatus = 'pending' | 'active' | 'working' | 'done' | 'skipped'
type StepKind = 'signature' | 'backend' | 'wait'

const ONBOARD: {
  id: OnboardId
  title: string
  short: string
  kind: StepKind
}[] = [
  { id: 'connect', title: 'Connect', short: 'Connect', kind: 'signature' },
  { id: 'deploy2ld', title: 'Deploy', short: 'Deploy', kind: 'signature' },
  { id: 'commit', title: 'Commit', short: 'Commit', kind: 'signature' },
  { id: 'waitCommit', title: 'Wait', short: 'Wait', kind: 'wait' },
  { id: 'register', title: 'Register', short: 'Register', kind: 'signature' },
  { id: 'makeController', title: 'Control', short: 'Control', kind: 'signature' },
  { id: 'linkBackend', title: 'Link', short: 'Link', kind: 'backend' },
  { id: 'poseidon', title: 'Poseidon', short: 'Poseidon', kind: 'signature' },
  { id: 'ensureSemaphore', title: 'Group', short: 'Group', kind: 'signature' },
  { id: 'grantSemaphore', title: 'Grant', short: 'Grant', kind: 'signature' },
  { id: 'publishSemaphore', title: 'Publish', short: 'Publish', kind: 'signature' },
]

function emptyStatuses(): Record<OnboardId, StepStatus> {
  return {
    connect: 'active',
    deploy2ld: 'pending',
    commit: 'pending',
    waitCommit: 'pending',
    register: 'pending',
    makeController: 'pending',
    linkBackend: 'pending',
    poseidon: 'pending',
    ensureSemaphore: 'pending',
    grantSemaphore: 'pending',
    publishSemaphore: 'pending',
  }
}

export async function inspectCompleted(
  wallet: ConsoleWallet,
  label: string,
): Promise<OnboardId[]> {
  const done: OnboardId[] = ['connect']
  const slcAddr = await get2ld(wallet)
  const has2ld =
    Boolean(slcAddr) && slcAddr.toLowerCase() !== AddressZero.toLowerCase()
  if (!has2ld) {
    return done
  }
  done.push('deploy2ld')

  try {
    const owner = await resolveNameOwner(wallet, label)
    if (sameAddr(owner, slcAddr)) {
      done.push('commit', 'waitCommit', 'register')
    }
  } catch {
    /* */
  }

  const slc = new Contract(slcAddr, ABI.slc, wallet.signer)
  const sliAddr = (await slc.getSecondLevelInteractor()) as string
  if (!sliAddr || sliAddr.toLowerCase() === AddressZero.toLowerCase()) {
    return done
  }
  const sli = new Contract(sliAddr, ABI.sli, wallet.signer)
  const role = id('CONTROLLER_ROLE')
  try {
    if (await sli.hasRole(role, wallet.config.backendAddress)) {
      done.push('makeController')
    }
  } catch {
    /* */
  }

  let linkedSemaphore: string | null = null
  try {
    const linked = await fetchLinkedDomain(label)
    if (linked) {
      done.push('linkBackend')
      linkedSemaphore = linked.semaphoreInteractor || null
    }
  } catch {
    /* */
  }

  try {
    if (await hasCode(wallet, wallet.config.contracts.PoseidonT3)) {
      done.push('poseidon')
    }
  } catch {
    /* */
  }

  try {
    const siText = await readSemaphoreInteractorText(wallet, label)
    const si = siText || linkedSemaphore
    if (si && (await hasCode(wallet, si))) {
      done.push('ensureSemaphore')
      try {
        if (await sli.hasRole(role, si)) {
          done.push('grantSemaphore')
        }
      } catch {
        /* */
      }
      if (siText) {
        done.push('publishSemaphore')
      }
    }
  } catch {
    /* */
  }

  return done
}

export function isWizardComplete(done: readonly string[]): boolean {
  return onboardIds.every((id) => done.includes(id))
}

const PENDING_DOMAIN_KEY = 'aegis.pendingDomain'

export function stashPendingDomain(domain: string, buy: boolean): void {
  sessionStorage.setItem(
    PENDING_DOMAIN_KEY,
    JSON.stringify({ domain, buy }),
  )
}

export function takePendingDomain(): { domain: string; buy: boolean } | null {
  const raw = sessionStorage.getItem(PENDING_DOMAIN_KEY)
  if (!raw) return null
  sessionStorage.removeItem(PENDING_DOMAIN_KEY)
  try {
    const parsed = JSON.parse(raw) as { domain?: unknown; buy?: unknown }
    const domain = String(parsed.domain || '')
      .trim()
      .toLowerCase()
    if (!domain) return null
    return { domain, buy: Boolean(parsed.buy) }
  } catch {
    return null
  }
}

export function ProviderSetupPage() {
  const { wallet, chooseDomain } = useProviderStudio()
  const [domainInput, setDomainInput] = useState('')
  const [domainError, setDomainError] = useState<string | undefined>()
  const [buyName, setBuyName] = useState(false)
  const [started, setStarted] = useState(false)
  const [name, setName] = useState('')
  const [session, setSession] = useState<ConsoleWallet | null>(null)
  const [statuses, setStatuses] = useState(emptyStatuses)
  const [activeId, setActiveId] = useState<OnboardId>('connect')
  const [busy, setBusy] = useState(false)
  const [waitLeft, setWaitLeft] = useState(0)
  const [semaphoreInteractor, setSemaphoreInteractor] = useState<string | null>(
    null,
  )
  const [txLogs, setTxLogs] = useState<string[]>([])

  useEffect(() => {
    txLogSink = (line) => {
      setTxLogs((prev) => [...prev.slice(-50), line])
    }
    return () => {
      txLogSink = null
    }
  }, [])

  useEffect(() => {
    const pending = takePendingDomain()
    if (!pending) return
    setDomainInput(pending.domain)
    setName(pending.domain)
    setBuyName(pending.buy)
    setStarted(true)
    setStatuses(emptyStatuses())
    setActiveId('connect')
  }, [])

  useEffect(() => {
    if (statuses.waitCommit !== 'working' || waitLeft <= 0) return
    const timer = window.setTimeout(() => setWaitLeft((n) => n - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [statuses.waitCommit, waitLeft])

  useEffect(() => {
    if (statuses.waitCommit !== 'working' || waitLeft > 0) return
    let cancelled = false
    void (async () => {
      if (session) {
        const completed = await inspectCompleted(session, name)
        if (cancelled) return
        if (completed.includes('register')) {
          applyCompleted(completed)
          return
        }
      }
      if (cancelled) return
      setStatuses((prev) => ({
        ...prev,
        waitCommit: 'done',
        register: 'active',
      }))
      setActiveId('register')
    })()
    return () => {
      cancelled = true
    }
  }, [statuses.waitCommit, waitLeft, session, name])

  function applyCompleted(completed: OnboardId[]) {
    const doneSet = new Set(completed)
    const first = onboardIds.find((id) => !doneSet.has(id))
    setStatuses(() => {
      const next = emptyStatuses()
      let locked = false
      for (const id of onboardIds) {
        if (!locked && doneSet.has(id)) {
          next[id] = 'done'
          continue
        }
        if (!locked) {
          next[id] = 'active'
          locked = true
          continue
        }
        next[id] = 'pending'
      }
      return next
    })
    if (first) {
      setActiveId(first)
    } else {
      chooseDomain(name)
    }
    return first
  }

  function begin(buy: boolean) {
    setDomainError(undefined)
    try {
      const valid = requireDomain(domainInput)
      setName(valid)
      setBuyName(buy)
      setStarted(true)
      setStatuses(emptyStatuses())
      setActiveId('connect')
      setSession(null)
      setSemaphoreInteractor(null)
    } catch (error) {
      if (isValidationError(error)) {
        setDomainError(error.fieldErrors.domain)
        return
      }
      throw error
    }
  }

  function advance(from: OnboardId, skip: OnboardId[] = []) {
    const fromIndex = onboardIds.indexOf(from)
    const skipSet = new Set(skip)
    const next = onboardIds.find(
      (id, index) => index > fromIndex && !skipSet.has(id),
    )
    setStatuses((prev) => {
      const nextStatuses = { ...prev, [from]: 'done' as const }
      for (const id of skip) {
        nextStatuses[id] = 'done'
      }
      if (next) {
        nextStatuses[next] = 'active'
      }
      return nextStatuses
    })
    if (next) {
      setActiveId(next)
    } else {
      chooseDomain(name)
    }
  }

  async function runActive() {
    const step = ONBOARD.find((row) => row.id === activeId)
    if (!step || busy) return
    setDomainError(undefined)
    setBusy(true)
    setStatuses((prev) => ({ ...prev, [activeId]: 'working' }))
    logAegis(`step ${activeId}`)
    try {
      if (activeId === 'connect') {
        const connected = await connectConsoleWallet()
        if (wallet && connected.address.toLowerCase() !== wallet.toLowerCase()) {
          throw new Error(
            `MetaMask is ${connected.address}, console session is ${wallet}. Switch account.`,
          )
        }
        setSession(connected)
        const completed = await inspectCompleted(connected, name)
        const doneSet = new Set(completed)
        const slcAddr = await get2ld(connected)
        const owner = await resolveNameOwner(connected, name)
        if (!buyName && !doneSet.has('deploy2ld')) {
          throw new Error(
            'This wallet has no 2LD controller on Sepolia. Use Buy this name, or switch to the owner wallet.',
          )
        }
        if (sameAddr(owner, slcAddr)) {
          doneSet.add('commit')
          doneSet.add('waitCommit')
          doneSet.add('register')
        } else if (owner) {
          throw new Error(
            `${name}.global is already owned by ${owner}. This wallet's 2LD controller is ${slcAddr || 'none'}. Switch account or pick another label.`,
          )
        } else if (!buyName && !doneSet.has('register')) {
          throw new Error(
            `${name}.global is not owned by this wallet. Use Buy this name.`,
          )
        }
        logAegis('inspect after connect', completed)
        applyCompleted([...doneSet])
        return
      }

      if (!session) {
        throw new Error('Connect wallet first.')
      }

      const already = await inspectCompleted(session, name)
      logAegis(`inspect before ${activeId}`, already)
      if (
        already.includes(activeId) &&
        activeId !== 'poseidon' &&
        activeId !== 'ensureSemaphore'
      ) {
        logAegis(`skip ${activeId}, inspect already done`)
        applyCompleted(already)
        return
      }

      if (activeId === 'deploy2ld') {
        await registerAsDomainOwner(session)
        advance('deploy2ld')
        return
      }

      if (activeId === 'commit') {
        const slcAddr = await get2ld(session)
        if (!slcAddr || slcAddr.toLowerCase() === AddressZero.toLowerCase()) {
          throw new Error('no 2LD controller')
        }
        const owner = await resolveNameOwner(session, name)
        if (sameAddr(owner, slcAddr)) {
          advance('commit', ['waitCommit', 'register'])
          return
        }
        if (owner) {
          throw new Error(
            `${name}.global is already owned by ${owner}, not your 2LD controller.`,
          )
        }
        const duration = 365 * 24 * 60 * 60
        const secret = id('secret')
        const resolver = requireContract(session.config.contracts, 'PublicResolver')
        const eth = new Contract(
          requireContract(session.config.contracts, 'ETHRegistrarController'),
          ABI.eth,
          session.signer,
        )
        const commitment = await eth.makeCommitment(
          name,
          slcAddr,
          duration,
          secret,
          resolver,
          [],
          false,
          0,
        )
        const exists = (await eth.commitments(commitment)).toNumber() !== 0
        if (!exists) {
          const commitTx = await eth.commit(commitment)
          await waitTx('commit', commitTx)
        } else {
          logAegis('commit skip, already exists')
        }
        const minAge = exists ? 0 : (await eth.minCommitmentAge()).toNumber()
        const seconds = exists ? 0 : Math.max(minAge, 10)
        if (seconds <= 0) {
          advance('commit', ['waitCommit'])
          return
        }
        setWaitLeft(seconds)
        setStatuses((prev) => ({
          ...prev,
          commit: 'done',
          waitCommit: 'working',
        }))
        setActiveId('waitCommit')
        return
      }

      if (activeId === 'register') {
        await purchaseName(session, name)
        advance('register')
        return
      }

      if (activeId === 'makeController') {
        const slcAddr = await get2ld(session)
        const slc = new Contract(slcAddr, ABI.slc, session.signer)
        const interactorAddr = (await slc.getSecondLevelInteractor()) as string
        const interactor = new Contract(interactorAddr, ABI.sli, session.signer)
        const role = id('CONTROLLER_ROLE')
        if (await interactor.hasRole(role, session.config.backendAddress)) {
          logAegis('control skip, backend already has CONTROLLER_ROLE')
          advance('makeController')
          return
        }
        const tx = await interactor.makeController(session.config.backendAddress)
        await waitTx('makeController', tx)
        advance('makeController')
        return
      }

      if (activeId === 'linkBackend') {
        const slcAddr = await get2ld(session)
        const slc = new Contract(slcAddr, ABI.slc, session.signer)
        const interactorAddr = (await slc.getSecondLevelInteractor()) as string
        await linkDomain(name, session.address, {
          secondLevelInteractor: interactorAddr,
        })
        logAegis('linkDomain ok', { name, interactorAddr })
        advance('linkBackend')
        return
      }

      if (activeId === 'poseidon') {
        const addr = await deployPoseidonT3(session)
        logAegis('poseidon result', addr)
        advance('poseidon')
        return
      }

      if (activeId === 'ensureSemaphore') {
        const slcAddr = await get2ld(session)
        const slc = new Contract(slcAddr, ABI.slc, session.signer)
        const interactorAddr = (await slc.getSecondLevelInteractor()) as string
        let si = semaphoreInteractor
        if (!si) {
          si = await readSemaphoreInteractorText(session, name)
        }
        if (!si) {
          try {
            const linked = await fetchLinkedDomain(name)
            si = linked?.semaphoreInteractor || null
          } catch {
            /* */
          }
        }
        if (si && !(await hasCode(session, si))) {
          logAegis('group stored SI has no code, deploying', si)
          si = null
        }
        if (!si) {
          si = await deploySemaphoreInteractor(session, interactorAddr)
          logAegis('group result', si)
          try {
            await linkDomain(name, session.address, {
              secondLevelInteractor: interactorAddr,
              semaphoreInteractor: si,
            })
            logAegis('group linkDomain ok')
          } catch (err) {
            logAegis('group linkDomain failed', err instanceof Error ? err.message : String(err))
          }
        } else {
          logAegis('group skip, SI already on chain', si)
        }
        setSemaphoreInteractor(si)
        const interactor = new Contract(interactorAddr, ABI.sli, session.signer)
        const role = id('CONTROLLER_ROLE')
        if (await interactor.hasRole(role, si)) {
          advance('ensureSemaphore', ['grantSemaphore'])
          return
        }
        advance('ensureSemaphore')
        return
      }

      if (activeId === 'grantSemaphore') {
        let si = semaphoreInteractor
        if (!si) {
          const linked = await fetchLinkedDomain(name)
          si = linked?.semaphoreInteractor || null
        }
        if (!si) {
          throw new Error('No SemaphoreInteractor from the previous step.')
        }
        setSemaphoreInteractor(si)
        const slcAddr = await get2ld(session)
        const slc = new Contract(slcAddr, ABI.slc, session.signer)
        const interactorAddr = (await slc.getSecondLevelInteractor()) as string
        const interactor = new Contract(interactorAddr, ABI.sli, session.signer)
        const role = id('CONTROLLER_ROLE')
        if (!(await interactor.hasRole(role, si))) {
          const grantTx = await interactor.grantRole(role, si)
          await waitTx('grantRole CONTROLLER_ROLE', grantTx)
        } else {
          logAegis('grant skip, SI already has CONTROLLER_ROLE', si)
        }
        advance('grantSemaphore')
        return
      }

      if (activeId === 'publishSemaphore') {
        let si = semaphoreInteractor
        if (!si) {
          const linked = await fetchLinkedDomain(name)
          si = linked?.semaphoreInteractor || null
        }
        if (!si) {
          throw new Error('No SemaphoreInteractor from the previous step.')
        }
        setSemaphoreInteractor(si)
        await publishSemaphoreInteractorText(session, name, si)
        advance('publishSemaphore')
        return
      }
    } catch (error) {
      logAegis(`step ${activeId} failed`, error instanceof Error ? error.message : String(error))
      console.error('[aegis] step failed', activeId, error)
      setStatuses((prev) => ({ ...prev, [activeId]: 'active' }))
      setDomainError(error instanceof Error ? error.message : String(error))
    } finally {
      setBusy(false)
    }
  }

  const autoConnect = useRef(false)
  useEffect(() => {
    if (autoConnect.current) return
    if (!started || !wallet || session || activeId !== 'connect' || busy) return
    autoConnect.current = true
    void runActive()
  }, [started, wallet, session, activeId, busy])

  if (!started) {
    return (
      <Page>
        <div className={styles.chamber}>
        <Stack gap={stackGap.md}>
          <Eyebrow>Setup</Eyebrow>
          <Heading level={1}>
            Onboard this 2LD.
          </Heading>
          <Text size={textSize.lg} tone={textTone.mute}>
            Type the label. Each chain action waits until you click Prompt
            signature. Backend calls wait on Run. Sepolia only.
          </Text>
          <Card>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                begin(false)
              }}
              noValidate
            >
              <Stack gap={stackGap.md}>
                <Field
                  label="Domain"
                  htmlFor="provider-domain"
                  error={domainError}
                >
                  <Input
                    id="provider-domain"
                    name="domain"
                    placeholder="yourstudio"
                    value={domainInput}
                    hasError={Boolean(domainError)}
                    onChange={(event) => setDomainInput(event.target.value)}
                  />
                </Field>
                <Text tone={textTone.mute}>
                  {domainInput.trim() || 'yourstudio'}.global
                </Text>
                <Cluster>
                  <Button type="submit">I already own this name</Button>
                  <Button
                    type="button"
                    variant={actionVariant.secondary}
                    onClick={() => begin(true)}
                  >
                    Buy this name
                  </Button>
                </Cluster>
              </Stack>
            </form>
          </Card>
        </Stack>
        </div>
      </Page>
    )
  }

  return (
    <Page>
      <div className={styles.chamber}>
      <Stack gap={stackGap.md}>
        <Eyebrow>{name}.global</Eyebrow>
        <Heading level={1}>
          {buyName ? 'Purchase and link' : 'Link existing name'}.
        </Heading>
        {domainError ? <Text tone={textTone.mute}>{domainError}</Text> : null}
        <div className={styles.board} role="list">
          {ONBOARD.map((row) => {
            const status = statuses[row.id]
            return (
              <div
                key={row.id}
                role="listitem"
                className={styles.cell}
                data-status={status}
                aria-label={row.short}
                aria-current={
                  status === 'active' || status === 'working' ? 'step' : undefined
                }
              >
                <span className={styles.bar} />
                <span className={styles.word}>{row.short}</span>
              </div>
            )
          })}
        </div>
        {(() => {
          const row = ONBOARD.find((step) => {
            const status = statuses[step.id]
            return status === 'active' || status === 'working'
          })
          if (!row) return null
          const status = statuses[row.id]
          return (
            <Card>
              <Stack gap={stackGap.md}>
                <Heading level={2}>{row.title}</Heading>
                {row.id === 'waitCommit' && status === 'working' ? (
                  <Text>{waitLeft}s remaining</Text>
                ) : null}
                {status === 'active' && row.kind !== 'wait' ? (
                  <Button
                    type="button"
                    size={actionSize.lg}
                    disabled={busy}
                    onClick={() => void runActive()}
                  >
                    {row.kind === 'signature' ? 'Prompt signature' : 'Run'}
                  </Button>
                ) : null}
                {status === 'working' && row.kind !== 'wait' ? (
                  <Text>Waiting on this step…</Text>
                ) : null}
                {txLogs.length ? (
                  <pre className={styles.logs}>{txLogs.join('\n')}</pre>
                ) : null}
              </Stack>
            </Card>
          )
        })()}
      </Stack>
      </div>
    </Page>
  )
}
