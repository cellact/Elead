import type { ReactNode } from 'react'
import { getCategory } from '@/shared/data/catalog'
import type { ServiceRequest } from '@/shared/data/types'
import { formatDate } from '@/shared/lib/format'
import { Card } from '@/shared/ui/Card/Card'
import { Heading } from '@/shared/ui/Heading/Heading'
import { StatusBadge } from '@/shared/ui/StatusBadge/StatusBadge'
import styles from '@/shared/ui/RequestCard/RequestCard.module.css'

type RequestCardProps = {
  request: ServiceRequest
  showClient?: boolean
  actions?: ReactNode
}

export function RequestCard({
  request,
  showClient = false,
  actions,
}: RequestCardProps) {
  const category = getCategory(request.categoryId)

  return (
    <Card>
      <div className={styles.meta}>
        <span>{category.name}</span>
        <StatusBadge status={request.status} />
      </div>
      <Heading level={3}>{request.title}</Heading>
      <p className={styles.details}>{request.details}</p>
      <div className={styles.meta}>
        <span>{request.location}</span>
        <span>{request.budget}</span>
        <span>{formatDate(request.createdAt)}</span>
        {showClient ? <span>{request.clientName}</span> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </Card>
  )
}
