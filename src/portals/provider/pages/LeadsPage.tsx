import { requestStatus } from '@/shared/data/types'
import { Page } from '@/shared/layout/Page/Page'
import { useAppState } from '@/shared/state/useAppState'
import { Button } from '@/shared/ui/Button/Button'
import { actionVariant, actionSize } from '@/shared/ui/action/action'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Heading } from '@/shared/ui/Heading/Heading'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { RequestCard } from '@/shared/ui/RequestCard/RequestCard'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textTone } from '@/shared/ui/Text/textTokens'

export function LeadsPage() {
  const { requests, setRequestStatus } = useAppState()

  return (
    <Page>
      <Stack gap={stackGap.md}>
        <Eyebrow>Leads</Eyebrow>
        <Heading level={1}>
          Work that wants a <RainbowText>name</RainbowText>.
        </Heading>
        <Text tone={textTone.mute}>
          Accept to match. Pass to close. Status is shared with the client
          studio.
        </Text>
      </Stack>

      {requests.length === 0 ? (
        <Text tone={textTone.mute}>No leads in the room.</Text>
      ) : (
        <Stack>
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              showClient
              actions={
                request.status === requestStatus.open ? (
                  <>
                    <Button
                      size={actionSize.sm}
                      onClick={() =>
                        setRequestStatus(request.id, requestStatus.matched)
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      size={actionSize.sm}
                      variant={actionVariant.secondary}
                      onClick={() =>
                        setRequestStatus(request.id, requestStatus.closed)
                      }
                    >
                      Pass
                    </Button>
                  </>
                ) : null
              }
            />
          ))}
        </Stack>
      )}
    </Page>
  )
}
