import { useMemo } from 'react'
import { routes } from '@/config/routes'
import { useProviderStudio } from '@/shared/provider/useProviderStudio'
import { isSetupComplete } from '@/shared/provider/types'
import { Heading } from '@/shared/ui/Heading/Heading'
import { LinkButton } from '@/shared/ui/LinkButton/LinkButton'
import { actionSize } from '@/shared/ui/action/action'
import styles from '@/pages/LandingPage.module.css'

const COLS = 56
const ROWS = 36

type Tile = {
  x: number
  y: number
  size: number
  tone: number
  delay: string
  duration: string
  bandDelay: string
}

function hash(n: number): number {
  const x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b)
  return (x ^ (x >>> 13)) >>> 0
}

function buildTiles(): Tile[] {
  const gap = 0.14
  const tiles: Tile[] = []
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const n = hash(row * 97 + col * 13 + 7)
      const span = COLS + ROWS * 0.55
      tiles.push({
        x: col + gap / 2,
        y: row + gap / 2,
        size: 1 - gap,
        tone: n % 7,
        delay: `${(n % 29) * -0.28}s`,
        duration: `${8 + (n % 8) * 0.9}s`,
        bandDelay: `${((col + row * 0.55) / span) * 0.95}s`,
      })
    }
  }
  return tiles
}

export function LandingPage() {
  const { isSignedIn, account } = useProviderStudio()
  const tiles = useMemo(() => buildTiles(), [])
  const href = useMemo(() => {
    if (isSignedIn && isSetupComplete(account)) return routes.studio
    if (isSignedIn) return routes.find
    return routes.connect
  }, [isSignedIn, account])

  return (
    <div className={styles.frame}>
      <div className={styles.stage}>
        <svg
          className={styles.mosaic}
          viewBox={`0 0 ${COLS} ${ROWS}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {tiles.map((tile, index) => (
            <rect
              key={index}
              className={styles.tile}
              data-tone={tile.tone}
              x={tile.x}
              y={tile.y}
              width={tile.size}
              height={tile.size}
              style={{
                ['--delay' as string]: tile.delay,
                ['--duration' as string]: tile.duration,
                ['--band-delay' as string]: tile.bandDelay,
              }}
            />
          ))}
        </svg>
        <div className={styles.content}>
          <p className={styles.wordmark}>Aegis</p>
          <Heading level={1} display>
            Protect your users.
          </Heading>
          <LinkButton to={href} size={actionSize.lg}>
            Get started
          </LinkButton>
        </div>
      </div>
    </div>
  )
}
