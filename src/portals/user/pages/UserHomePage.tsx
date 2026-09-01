import { routes } from '@/shared/config/routes'
import { Page } from '@/shared/layout/Page/Page'
import { Card } from '@/shared/ui/Card/Card'
import { Eyebrow } from '@/shared/ui/Eyebrow/Eyebrow'
import { Heading } from '@/shared/ui/Heading/Heading'
import { LinkButton } from '@/shared/ui/LinkButton/LinkButton'
import { RainbowText } from '@/shared/ui/RainbowText/RainbowText'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import { Text } from '@/shared/ui/Text/Text'
import { textSize, textTone } from '@/shared/ui/Text/textTokens'

export function UserHomePage() {
  return (
    <Page>
      <Stack gap={stackGap.md}>
        <Eyebrow>Client studio</Eyebrow>
        <Heading level={1}>
          Get in touch <RainbowText>without</RainbowText> giving 
          <br />
          <RainbowText>your contact information.</RainbowText>
        </Heading>
        <Text size={textSize.lg} tone={textTone.mute}>
          You get a private Elead line. Scan a QR code, activate the ELead line, and
          write what you need there. The provider writes back on that line —
          not to your phone or email.
        </Text>
        <LinkButton to={routes.user.contact}>Contact us</LinkButton>
      </Stack>

      <Card>
        <Stack gap={stackGap.sm}>
          <Eyebrow>What you do not leave behind</Eyebrow>
          <Heading level={3}>No phone. No email. Nothing to misuse.</Heading>
          <Text tone={textTone.mute}>
            A callback number can be stored, shared, or used again later. Here
            you never hand it over. The conversation stays on the private line
            you just received. Free to use.
          </Text>
        </Stack>
      </Card>
    </Page>
  )
}
