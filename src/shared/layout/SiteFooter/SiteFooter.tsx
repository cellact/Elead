import { Link } from 'react-router-dom'
import { marketingNav, site } from '@/shared/config/site'
import { Container } from '@/shared/ui/Container/Container'
import styles from '@/shared/layout/SiteFooter/SiteFooter.module.css'

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.row}>
          <p className={styles.wordmark}>{site.name}</p>
          <div className={styles.meta}>
            <span>{site.tagline}</span>
            <div className={styles.links}>
              {marketingNav.map((item) => (
                <Link key={item.to} to={item.to} className={styles.link}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
