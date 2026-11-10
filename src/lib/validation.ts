/** Limits shared with the database check constraints (migration 20261110000100_security.sql). */
export const LIMITS = {
  titleMin: 3,
  titleMax: 150,
  contentMax: 5000,
  solutionMax: 5000,
  labelMax: 60,
} as const

/**
 * Checks a report before sending it, with the same limits as the database.
 * @returns an error message for the user, or null when the report is valid
 */
export function validateReport(title: string, content: string, solution: string): string | null {
  const cleanTitle = title.trim()
  if (cleanTitle.length < LIMITS.titleMin)
    return `Le titre doit faire au moins ${LIMITS.titleMin} caractères.`
  if (cleanTitle.length > LIMITS.titleMax)
    return `Le titre doit faire au plus ${LIMITS.titleMax} caractères.`
  if (!content.trim()) return 'Décrivez le problème.'
  if (content.length > LIMITS.contentMax)
    return `La description doit faire au plus ${LIMITS.contentMax} caractères.`
  if (solution.length > LIMITS.solutionMax)
    return `La solution doit faire au plus ${LIMITS.solutionMax} caractères.`
  return null
}
