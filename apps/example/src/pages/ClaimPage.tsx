import { useSearchParams } from 'react-router-dom'
import { useClaim } from '@/hooks/useClaim'
import { Page } from '@/shared/layout/Page/Page'
import { Button } from '@/shared/ui/Button/Button'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Heading } from '@/shared/ui/Heading/Heading'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'

const WEB3_SUFFIX = '.arnacon.global'

function canonicalWeb3Identity(raw: string): string | null {
  const value = raw.trim().toLowerCase()
  if (value.endsWith(WEB3_SUFFIX)) {
    return value
  }
  if (/^(?:[a-z0-9]|[a-z0-9][a-z0-9-]{0,61}[a-z0-9])$/.test(value)) {
    return `${value}${WEB3_SUFFIX}`
  }
  return null
}

export function ClaimPage() {
  const [searchParams] = useSearchParams()
  const secret = searchParams.get('secret')
  const label = searchParams.get('label')
  const ownerRaw = searchParams.get('owner')
  const owner =
    ownerRaw && /^0x[a-fA-F0-9]{40}$/.test(ownerRaw) ? ownerRaw : undefined
  const web3identityRaw = searchParams.get('web3identity')
  const web3identity = web3identityRaw
    ? canonicalWeb3Identity(web3identityRaw)
    : owner
      ? canonicalWeb3Identity(owner)
      : null

  const { status, step, data, error, errorKind, claim, reset } = useClaim()

  if (!secret || !label || !web3identity) {
    return (
      <Page width="narrow">
        <Stack gap={stackGap.md}>
          <Eyebrow>Claim</Eyebrow>
          <Heading level={1}>Invalid activation link</Heading>
          <Text tone={textTone.mute}>
            Need query params secret, label, and web3identity (Arnacon appends
            web3identity). For desktop tests add owner=0x… as well.
          </Text>
        </Stack>
      </Page>
    )
  }

  if (status === 'success' && data) {
    return (
      <Page width="narrow">
        <Stack gap={stackGap.md}>
          <Eyebrow>Claimed</Eyebrow>
          <Heading level={1}>
            Line is <RainbowText>active</RainbowText>.
          </Heading>
          <Text size={textSize.lg}>{data.name}</Text>
          <Text tone={textTone.mute}>Owner {data.owner}</Text>
          {data.transactionHash ? (
            <Text tone={textTone.mute}>{data.transactionHash}</Text>
          ) : null}
        </Stack>
      </Page>
    )
  }

  const steps = [
    'Loading Semaphore group',
    'Generating zero-knowledge proof',
    'Submitting proof on-chain',
  ]

  return (
    <Page width="narrow">
      <Stack gap={stackGap.md}>
        <Eyebrow>Activate</Eyebrow>
        <Heading level={1}>
          Activate this <RainbowText>Elead</RainbowText> line.
        </Heading>
        <Text size={textSize.lg} tone={textTone.mute}>
          {label}
        </Text>
        {status === 'loading' ? (
          <Text tone={textTone.mute}>{steps[Math.max(0, step - 1)] || steps[2]}…</Text>
        ) : null}
        {status === 'error' ? (
          <Text tone={textTone.mute}>
            {errorKind === 'already_activated'
              ? 'This line is already activated.'
              : error}
          </Text>
        ) : null}
        {errorKind !== 'already_activated' ? (
          <Button
            disabled={status === 'loading'}
            onClick={() => {
              if (status === 'error') reset()
              void claim(secret, label, web3identity, owner)
            }}
          >
            {status === 'loading'
              ? steps[Math.max(0, Math.min(step - 1, 2))]
              : status === 'error'
                ? 'Retry'
                : 'Activate'}
          </Button>
        ) : null}
      </Stack>
    </Page>
  )
}
