/** Limits shared with the database check constraints (see supabase/migrations). */
export const LIMITS = {
  titleMin: 3,
  titleMax: 150,
  contentMax: 5000,
  solutionMax: 5000,
  commentMax: 2000,
  messageMax: 500,
  labelMax: 60,
  passwordMin: 8,
} as const

/** Checks the one-sentence title of a report. */
export function validateTitle(title: string): string | null {
  const clean = title.trim()
  if (clean.length < LIMITS.titleMin) return `Écrivez au moins ${LIMITS.titleMin} caractères.`
  if (clean.length > LIMITS.titleMax) return `${LIMITS.titleMax} caractères au maximum.`
  return null
}

/** Checks a long text (description, solution, comment) against its limit. */
export function validateText(text: string, max: number, required = true): string | null {
  if (required && !text.trim()) return 'Ce champ est obligatoire.'
  if (text.length > max) return `${max} caractères au maximum.`
  return null
}

/** Checks a new password against the server rules: 8 characters, letters and digits. */
export function validatePassword(password: string, confirmation: string): string | null {
  if (password.length < LIMITS.passwordMin || !/[a-z]/i.test(password) || !/\d/.test(password)) {
    return 'Au moins 8 caractères, avec des lettres et des chiffres.'
  }
  if (password !== confirmation) return 'Les deux mots de passe ne sont pas identiques.'
  return null
}

/** Checks a phone number for a call-back. */
export function validatePhone(phone: string): string | null {
  return /^\+?[0-9 .-]{6,20}$/.test(phone.trim()) ? null : 'Numéro de téléphone non valide.'
}
