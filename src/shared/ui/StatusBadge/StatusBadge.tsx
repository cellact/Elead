import { requestStatus, type RequestStatus } from '@/shared/data/types'
import { unreachable } from '@/shared/lib/assert'
import { Badge } from '@/shared/ui/Badge/Badge'
import { badgeTone } from '@/shared/ui/Badge/badgeTone'

type StatusBadgeProps = {
  status: RequestStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge tone={toneForStatus(status)}>{labelForStatus(status)}</Badge>
}

function toneForStatus(status: RequestStatus) {
  if (status === requestStatus.open) return badgeTone.solid
  if (status === requestStatus.matched) return badgeTone.outline
  if (status === requestStatus.closed) return badgeTone.outline
  return unreachable(status, 'Unknown request status')
}

function labelForStatus(status: RequestStatus): string {
  if (status === requestStatus.open) return 'Open'
  if (status === requestStatus.matched) return 'Matched'
  if (status === requestStatus.closed) return 'Closed'
  return unreachable(status, 'Unknown request status')
}
