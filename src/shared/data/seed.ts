import type { ProviderProfile, ServiceRequest } from '@/shared/data/types'
import { requestStatus } from '@/shared/data/types'

export const seedRequests: readonly ServiceRequest[] = [
  {
    id: 'req_seed_atelier',
    categoryId: 'architecture',
    title: 'Courtyard house, two volumes',
    details:
      'A quiet house for a family of four. Two volumes around a planted court. Prefer someone who draws by hand first.',
    location: 'Lisbon',
    budget: '€40–60k design',
    status: requestStatus.open,
    createdAt: '2026-08-12T09:00:00.000Z',
    clientName: 'M. Alvarez',
  },
  {
    id: 'req_seed_still',
    categoryId: 'photography',
    title: 'Hotel stills, winter light',
    details:
      'Three-day stills of a 22-room hotel. No lifestyle talent. Architecture and rooms only.',
    location: 'Antwerp',
    budget: '€8–12k',
    status: requestStatus.open,
    createdAt: '2026-08-20T14:30:00.000Z',
    clientName: 'H. Berg',
  },
  {
    id: 'req_seed_mark',
    categoryId: 'brand',
    title: 'Rename a 40-year press',
    details:
      'Independent press moving from a founder name to a house name. Need identity and a one-line position.',
    location: 'Remote / Paris',
    budget: '€18–25k',
    status: requestStatus.matched,
    createdAt: '2026-07-03T11:15:00.000Z',
    clientName: 'Atelier Nord',
  },
]

export const seedProfile: ProviderProfile = {
  name: '',
  trade: 'architecture',
  city: '',
  bio: '',
}
