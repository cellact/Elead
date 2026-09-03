import { useEffect, useState } from 'react'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract, ContractFactory } from '@ethersproject/contracts'
import { AddressZero } from '@ethersproject/constants'
import { id, namehash } from '@ethersproject/hash'
import { ensureSemaphore, fetchLinkedDomain, linkDomain } from '@/shared/identity/allocateIdentity'
import { Page } from '@/shared/layout/Page/Page'
import { isValidationError } from '@/shared/lib/errors'
import { connectConsoleWallet, type ConsoleWallet } from '@/pages/ProviderAuthPage'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'
import { requireDomain } from '@/shared/provider/validate'
import { Button } from '@/shared/ui/Button/Button'
import { Card } from '@/shared/ui/Card/Card'
import { Cluster } from '@/shared/ui/Cluster/Cluster'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Field } from '@/shared/ui/Field/Field'
import { Heading } from '@/shared/ui/Heading/Heading'
import { Input } from '@/shared/ui/Input/Input'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'
import { actionVariant } from '@/shared/ui/action/action'
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
  ],
  sli: [
    'function makeController(address newController)',
    'function arnaconResolver() view returns (address)',
    'function setArnaconResolver(address)',
    'function setSecondLevelController(address)',
    'function grantRole(bytes32 role, address account)',
    'function hasRole(bytes32 role, address account) view returns (bool)',
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

async function get2ld(wallet: ConsoleWallet): Promise<string> {
  const grc = new Contract(
    requireContract(wallet.config.contracts, 'GlobalRegistrarController'),
    ABI.grc,
    wallet.signer,
  )
  return grc.get2LDControllerFor(wallet.address) as Promise<string>
}

async function resolveNameOwner(
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

function sameAddr(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false
  if (a.toLowerCase() === AddressZero.toLowerCase()) return false
  return a.toLowerCase() === b.toLowerCase()
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
  await interactor.deployed()

  const resolverFactory = new ContractFactory(
    ['constructor(address)'],
    artifacts.ArnaconResolver.bytecode,
    wallet.signer,
  )
  const resolver = await resolverFactory.deploy(interactor.address)
  await resolver.deployed()

  const currentResolver = (await interactor.arnaconResolver()) as string
  if (currentResolver.toLowerCase() !== resolver.address.toLowerCase()) {
    const tx = await interactor.setArnaconResolver(resolver.address)
    await tx.wait()
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
  await deployTx.wait()
  const slcAddr = await get2ld(wallet)

  const slc = new Contract(slcAddr, ABI.slc, wallet.signer)
  const interactorInController = (await slc.getSecondLevelInteractor()) as string
  if (interactorInController.toLowerCase() !== interactor.address.toLowerCase()) {
    const t1 = await interactor.setSecondLevelController(slcAddr)
    await t1.wait()
    const t2 = await slc.setSecondLevelInteractor(interactor.address)
    await t2.wait()
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
  await tx.wait()
}

const onboardIds = [
  'connect',
  'deploy2ld',
  'commit',
  'waitCommit',
  'register',
  'makeController',
  'linkBackend',
  'ensureSemaphore',
  'grantSemaphore',
] as const

type OnboardId = (typeof onboardIds)[number]
type StepStatus = 'pending' | 'active' | 'working' | 'done' | 'skipped'
type StepKind = 'signature' | 'backend' | 'wait'

const ONBOARD: {
  id: OnboardId
  title: string
  copy: string
  kind: StepKind
}[] = [
  {
    id: 'connect',
    title: 'Connect wallet',
    copy: 'MetaMask on Sepolia. Same account that owns (or will own) the 2LD.',
    kind: 'signature',
  },
  {
    id: 'deploy2ld',
    title: 'Become an SP',
    copy: 'Deploy SecondLevelInteractor, ArnaconResolver, and 2LD controller if this wallet has none. Several signatures.',
    kind: 'signature',
  },
  {
    id: 'commit',
    title: 'Commit the name',
    copy: 'ENS-style commitment for this .global label.',
    kind: 'signature',
  },
  {
    id: 'waitCommit',
    title: 'Wait out minCommitmentAge',
    copy: 'Required before register. No signature.',
    kind: 'wait',
  },
  {
    id: 'register',
    title: 'Register the name',
    copy: 'Pay rent and assign the label to your 2LD controller.',
    kind: 'signature',
  },
  {
    id: 'makeController',
    title: 'Make Elead a controller',
    copy: 'makeController(backendAddress) on your SecondLevelInteractor.',
    kind: 'signature',
  },
  {
    id: 'linkBackend',
    title: 'Link domain on Elead',
    copy: 'POST /linkDomain so Cloud Run knows this 2LD. No wallet signature.',
    kind: 'backend',
  },
  {
    id: 'ensureSemaphore',
    title: 'Semaphore group',
    copy: 'POST /ensureSemaphore. Backend deploys SemaphoreInteractor for this 2LD.',
    kind: 'backend',
  },
  {
    id: 'grantSemaphore',
    title: 'Grant CONTROLLER_ROLE',
    copy: 'Let that SemaphoreInteractor register subnodes on your 2LD.',
    kind: 'signature',
  },
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
    ensureSemaphore: 'pending',
    grantSemaphore: 'pending',
  }
}

function markLabel(status: StepStatus): string {
  if (status === 'done') return 'done'
  if (status === 'working') return 'running'
  if (status === 'active') return 'now'
  if (status === 'skipped') return 'skip'
  return 'wait'
}

async function inspectCompleted(
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

  try {
    const linked = await fetchLinkedDomain(label)
    if (linked) {
      done.push('linkBackend')
      if (linked.semaphoreInteractor) {
        done.push('ensureSemaphore')
        try {
          if (await sli.hasRole(role, linked.semaphoreInteractor)) {
            done.push('grantSemaphore')
          }
        } catch {
          /* */
        }
      }
    }
  } catch {
    /* */
  }

  return done
}

export function ProviderSetupPage() {
  const { wallet, chooseDomain, signOut } = useProviderStudio()
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
      for (const id of onboardIds) {
        next[id] = doneSet.has(id) ? 'done' : 'pending'
      }
      if (first) {
        next[first] = 'active'
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
        applyCompleted([...doneSet])
        return
      }

      if (!session) {
        throw new Error('Connect wallet first.')
      }

      const already = await inspectCompleted(session, name)
      if (already.includes(activeId)) {
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
          await commitTx.wait()
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
          advance('makeController')
          return
        }
        const tx = await interactor.makeController(session.config.backendAddress)
        await tx.wait()
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
        advance('linkBackend')
        return
      }

      if (activeId === 'ensureSemaphore') {
        const slcAddr = await get2ld(session)
        const slc = new Contract(slcAddr, ABI.slc, session.signer)
        const interactorAddr = (await slc.getSecondLevelInteractor()) as string
        const semaphore = await ensureSemaphore(name, interactorAddr)
        setSemaphoreInteractor(semaphore.semaphoreInteractor || null)
        if (!semaphore.needsGrant) {
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
        if (await interactor.hasRole(role, si)) {
          advance('grantSemaphore')
          return
        }
        const grantTx = await interactor.grantRole(role, si)
        await grantTx.wait()
        advance('grantSemaphore')
        return
      }
    } catch (error) {
      setStatuses((prev) => ({ ...prev, [activeId]: 'active' }))
      setDomainError(error instanceof Error ? error.message : String(error))
    } finally {
      setBusy(false)
    }
  }

  if (!started) {
    return (
      <Page>
        <Cluster>
          <Button variant={actionVariant.ghost} onClick={signOut}>
            Disconnect
          </Button>
        </Cluster>
        <Stack gap={stackGap.md}>
          <Eyebrow>01 / First-time setup</Eyebrow>
          <Heading level={1}>
            Onboard this <RainbowText>2LD</RainbowText> as a timeline.
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
      </Page>
    )
  }

  return (
    <Page>
      <Cluster>
        <Button variant={actionVariant.ghost} onClick={signOut}>
          Disconnect
        </Button>
      </Cluster>
      <Stack gap={stackGap.md}>
        <Eyebrow>01 / {name}.global</Eyebrow>
        <Heading level={1}>
          {buyName ? 'Purchase and link' : 'Link existing'}{' '}
          <RainbowText>timeline</RainbowText>.
        </Heading>
        <Text size={textSize.lg} tone={textTone.mute}>
          Prompt / Run re-reads chain first. If that step is already true it
          skips and jumps to whatever is left.
        </Text>
        {domainError ? <Text tone={textTone.mute}>{domainError}</Text> : null}
        <div className={styles.steps}>
          {ONBOARD.map((row, index) => {
            const status = statuses[row.id]
            return (
              <div
                key={row.id}
                className={styles.row}
                data-status={status}
              >
                <p className={styles.mark}>
                  {String(index + 1).padStart(2, '0')} / {markLabel(status)}
                </p>
                <Stack gap={stackGap.sm}>
                  <Heading level={3}>{row.title}</Heading>
                  <Text tone={textTone.mute}>{row.copy}</Text>
                  {row.id === 'waitCommit' && status === 'working' ? (
                    <Text tone={textTone.mute}>{waitLeft}s remaining</Text>
                  ) : null}
                  {status === 'active' && row.kind !== 'wait' ? (
                    <Button
                      type="button"
                      disabled={busy}
                      onClick={() => void runActive()}
                    >
                      {row.kind === 'signature' ? 'Prompt signature' : 'Run'}
                    </Button>
                  ) : null}
                  {status === 'working' && row.kind !== 'wait' ? (
                    <Text tone={textTone.mute}>Waiting on this step…</Text>
                  ) : null}
                </Stack>
              </div>
            )
          })}
        </div>
      </Stack>
    </Page>
  )
}
