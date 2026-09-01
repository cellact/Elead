import type { ReactNode } from 'react'
import { Container } from '@/shared/ui/Container/Container'
import { Stack } from '@/shared/ui/Stack/Stack'
import { stackGap } from '@/shared/ui/Stack/stackGap'
import styles from '@/shared/layout/Page/Page.module.css'

type PageProps = {
  width?: 'wide' | 'narrow'
  children: ReactNode
}

export function Page({ width = 'wide', children }: PageProps) {
  return (
    <main className={width === 'narrow' ? styles.narrow : styles.page}>
      <Container width={width}>
        <Stack gap={stackGap.lg}>{children}</Stack>
      </Container>
    </main>
  )
}
