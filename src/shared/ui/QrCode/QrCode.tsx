import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import styles from '@/shared/ui/QrCode/QrCode.module.css'

type QrCodeProps = {
  value: string
  label: string
}

function readColorToken(name: string): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()

  if (value === '') {
    throw new Error(`Missing color token: ${name}`)
  }

  return value
}

export function QrCode({ value, label }: QrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    QRCode.toDataURL(value, {
      margin: 1,
      width: 360,
      color: {
        dark: readColorToken('--color-ink'),
        light: readColorToken('--color-paper'),
      },
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url)
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          const detail =
            cause instanceof Error ? cause.message : 'Could not draw the scan code.'
          setError(new Error(detail))
        }
      })

    return () => {
      cancelled = true
    }
  }, [value])

  if (error) {
    return <p className={styles.pending}>{error.message}</p>
  }

  if (!dataUrl) {
    return <p className={styles.pending}>Preparing your code…</p>
  }

  return <img className={styles.qr} src={dataUrl} alt={label} />
}
