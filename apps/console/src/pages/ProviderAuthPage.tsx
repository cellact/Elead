import { useState } from 'react'
import {
  Web3Provider,
  type ExternalProvider,
  type JsonRpcSigner,
} from '@ethersproject/providers'
import { env } from '@/shared/lib/env'
import { Page } from '@/shared/layout/Page/Page'
import { minVisibleMs, waitRemaining } from '@/shared/lib/waitRemaining'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'
import { Button } from '@/shared/ui/Button/Button'
import { Card } from '@/shared/ui/Card/Card'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Heading } from '@/shared/ui/Heading/Heading'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'
import { WorkingStage } from '@/shared/ui/WorkingStage/WorkingStage'
import styles from '@/pages/ProviderAuthPage.module.css'

const CHAIN_META: Record<
  number,
  {
    hex: string
    chainName: string
    nativeCurrency: { name: string; symbol: string; decimals: number }
    rpcUrls: string[]
    blockExplorerUrls: string[]
  }
> = {
  137: {
    hex: '0x89',
    chainName: 'Polygon',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    rpcUrls: ['https://polygon.drpc.org'],
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  11155111: {
    hex: '0xaa36a7',
    chainName: 'Sepolia',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.drpc.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
}

type EthereumProvider = {
  isMetaMask?: boolean
  providers?: EthereumProvider[]
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

export type BackendConfig = {
  chainId: number
  backendAddress: string
  contracts: Record<string, string>
  artifacts: {
    SecondLevelInteractor: { bytecode: string }
    ArnaconResolver: { bytecode: string }
  }
}

export type ConsoleWallet = {
  provider: Web3Provider
  signer: JsonRpcSigner
  address: string
  config: BackendConfig
}

function getEthereum(): EthereumProvider | null {
  const eth = (window as Window & { ethereum?: EthereumProvider }).ethereum
  if (!eth) return null
  if (Array.isArray(eth.providers) && eth.providers.length) {
    return eth.providers.find((provider) => provider.isMetaMask) ?? eth
  }
  return eth
}

async function fetchConfig(): Promise<BackendConfig | null> {
  try {
    const res = await fetch(`${env.apiUrl.replace(/\/$/, '')}/config`)
    const data: unknown = await res.json().catch(() => null)
    if (!res.ok || !data || typeof data !== 'object') {
      return null
    }
    const record = data as Record<string, unknown>
    if (typeof record.chainId !== 'number' || !record.contracts) {
      return null
    }
    if (typeof record.backendAddress !== 'string') {
      return null
    }
    const artifacts = record.artifacts
    if (!artifacts || typeof artifacts !== 'object') {
      return null
    }
    return data as BackendConfig
  } catch {
    return null
  }
}

async function ensureChain(
  provider: Web3Provider,
  chainId: number,
): Promise<void> {
  const meta = CHAIN_META[chainId]
  if (!meta) {
    throw new Error(`unsupported chainId ${chainId}`)
  }
  const id = await provider.send('eth_chainId', [])
  if (parseInt(id, 16) === chainId) return
  try {
    await provider.send('wallet_switchEthereumChain', [{ chainId: meta.hex }])
  } catch (err) {
    const error = err as { code?: number }
    if (error.code === 4902) {
      await provider.send('wallet_addEthereumChain', [
        {
          chainId: meta.hex,
          chainName: meta.chainName,
          nativeCurrency: meta.nativeCurrency,
          rpcUrls: meta.rpcUrls,
          blockExplorerUrls: meta.blockExplorerUrls,
        },
      ])
      return
    }
    throw err
  }
}

export async function connectConsoleWallet(): Promise<ConsoleWallet> {
  const ethereum = getEthereum()
  if (!ethereum) {
    throw new Error('MetaMask is not available on this origin.')
  }

  const provider = new Web3Provider(ethereum as ExternalProvider, 'any')
  await provider.send('eth_requestAccounts', [])

  const config = await fetchConfig()
  if (!config) {
    throw new Error('backend /config failed — is elead-backend-gcp reachable?')
  }

  const targetChainId = Number(import.meta.env.VITE_CHAIN_ID) || 11155111
  if (config.chainId !== targetChainId) {
    throw new Error(
      `Backend is chain ${config.chainId}, console expects ${targetChainId} (Sepolia). Set Cloud Run CHAIN_ID=11155111.`,
    )
  }
  await ensureChain(provider, targetChainId)

  const signer = provider.getSigner()
  const address = await signer.getAddress()
  return { provider, signer, address, config }
}

export function ProviderAuthPage() {
  const { signIn } = useProviderStudio()
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | undefined>()

  async function onConnect() {
    setError(undefined)
    const startedAt = Date.now()
    setWorking(true)

    try {
      const wallet = await connectConsoleWallet()
      await waitRemaining(startedAt, minVisibleMs)
      signIn(wallet.address)
    } catch (err) {
      await waitRemaining(startedAt, minVisibleMs)
      setWorking(false)
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  if (working) {
    return (
      <Page width="narrow">
        <WorkingStage
          label="Connecting wallet"
          eyebrow="01 / Wallet"
          heading={
            <>
              Opening your <RainbowText>console</RainbowText>.
            </>
          }
          body="Connecting the wallet that owns your Arnacon domain. No email account."
        />
      </Page>
    )
  }

  return (
    <Page>
      <div className={styles.split}>
        <Stack gap={stackGap.md}>
          <Eyebrow>Connect wallet</Eyebrow>
          <Heading level={1}>
            Your domain is the <RainbowText>account</RainbowText>.
          </Heading>
          <Text size={textSize.lg} tone={textTone.mute}>
            Connect the wallet that owns your 2LD. If you do not have one yet,
            you buy it next. There is no username or email.
          </Text>
        </Stack>

        <Card>
          <Stack gap={stackGap.md}>
            <Stack gap={stackGap.sm}>
              <Eyebrow>MetaMask</Eyebrow>
              <Heading level={2}>Connect to continue</Heading>
              <Text tone={textTone.mute}>
                Ownership is on-chain. This console follows the connected
                wallet, not a password.
              </Text>
            </Stack>
            {error ? <Text tone={textTone.mute}>{error}</Text> : null}
            <div className={styles.formActions}>
              <Button onClick={() => void onConnect()}>Connect wallet</Button>
            </div>
          </Stack>
        </Card>
      </div>
    </Page>
  )
}
