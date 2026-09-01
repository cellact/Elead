import { site } from '@/shared/config/site'
import { Container } from '@/shared/ui/Container/Container'
import styles from '@/shared/layout/SiteFooter/SiteFooter.module.css'

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.row}>
          <p className={styles.wordmark}>{site.name}</p>
          <p className={styles.meta}>{site.tagline}</p>
        </div>
      </Container>
    </footer>
  )
}
