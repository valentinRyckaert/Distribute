import type { CategoryWithCount, CurrentUser, ReportCardData, ReportDetail } from '@/src/lib/types'

export const marie: CurrentUser = {
  id: 'u1',
  email: 'marie@corp.fr',
  name: 'Marie Durand',
  isAdmin: false,
}
export const admin: CurrentUser = {
  id: 'a1',
  email: 'julien@corp.fr',
  name: 'Julien',
  isAdmin: true,
}

export const wifi: CategoryWithCount = {
  BAS_id: 1,
  BAS_libelle: 'Internet & Wi-Fi',
  BAS_icon: 'wifi-outline',
  BAS_description: 'Réseau, connexion',
  reportCount: 2,
}

/** Builds a report card with sensible defaults. */
export function makeReport(overrides: Partial<ReportDetail> = {}): ReportDetail {
  return {
    REP_id: 1,
    REP_libelle: 'Le wifi se coupe',
    REP_content: 'Depuis ce matin',
    REP_solution: 'Oublier le réseau\nSe reconnecter',
    REP_is_solution_validated: true,
    REP_created_at: new Date().toISOString(),
    REP_helped_count: 3,
    REP_notify: true,
    REP_since: null,
    REP_photo_path: null,
    REP_solution_by: null,
    REP_duplicate_of: null,
    REP_search: null,
    AS_id: null,
    AT_id: null,
    BAS_id: 1,
    user_id: 'u1',
    Base: wifi,
    Comment: [],
    ...overrides,
  } as ReportDetail
}

export const card = (overrides: Partial<ReportCardData> = {}) =>
  makeReport(overrides) as ReportCardData
