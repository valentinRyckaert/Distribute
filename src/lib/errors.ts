/** Known technical messages and what to tell the user instead. */
const MESSAGES: [RegExp, string][] = [
  [/invalid login credentials/i, 'E-mail ou mot de passe incorrect.'],
  [
    /network|fetch|failed to connect/i,
    'Impossible de joindre le serveur. Vérifiez votre connexion.',
  ],
  [
    /token has expired|otp.*(invalid|expired)/i,
    'Ce code est faux ou a expiré. Demandez-en un nouveau.',
  ],
  [
    /password should|weak password|at least/i,
    'Mot de passe trop faible : 8 caractères minimum, avec des lettres et des chiffres.',
  ],
  [/rate limit|security purposes/i, 'Trop d’essais. Patientez une minute puis réessayez.'],
  [/already has a solution/i, 'Quelqu’un a déjà proposé une solution pour ce problème.'],
  [
    /not found or not allowed|permission|row-level security/i,
    'Vous n’avez pas le droit de faire cela.',
  ],
  [/duplicate key|unique/i, 'Cet élément existe déjà.'],
  [/check constraint/i, 'Certaines informations ne sont pas valides.'],
]

/** Turns any error into a short French sentence the user can act on. */
export function friendlyError(error: unknown): string {
  // Supabase errors are plain objects with a message, not always Error instances.
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String(error.message)
      : String(error)
  return (
    MESSAGES.find(([pattern]) => pattern.test(message))?.[1] ??
    'Une erreur est survenue. Réessayez.'
  )
}
