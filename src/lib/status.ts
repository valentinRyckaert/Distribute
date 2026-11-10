/** Where a report stands: waiting for a solution, solved, or solved and checked by the support. */
export type ReportStatus = 'pending' | 'resolved' | 'validated'

/** Derives the status of a report from its solution and validation flag. */
export function statusOf(report: {
  REP_solution: string | null
  REP_is_solution_validated: boolean
}): ReportStatus {
  if (!report.REP_solution?.trim()) return 'pending'
  return report.REP_is_solution_validated ? 'validated' : 'resolved'
}

/** Splits a solution into its steps, one per non-empty line. */
export function solutionSteps(solution: string | null): string[] {
  return (solution ?? '')
    .split('\n')
    .map((line) => line.replace(/^\s*(\d+[.)]|[-•*])\s*/, '').trim())
    .filter(Boolean)
}

/** Formats a date as a short, friendly French phrase ("aujourd'hui", "il y a 3 jours"). */
export function relativeDate(iso: string, now: Date = new Date()): string {
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000)
  if (days <= 0) return "aujourd'hui"
  if (days === 1) return 'hier'
  if (days < 7) return `il y a ${days} jours`
  if (days < 14) return 'il y a 1 semaine'
  if (days < 31) return `il y a ${Math.floor(days / 7)} semaines`
  return `le ${new Date(iso).toLocaleDateString('fr-FR')}`
}
