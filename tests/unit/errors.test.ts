import { friendlyError } from '@/src/lib/errors'

describe('friendlyError', () => {
  it.each([
    ['Invalid login credentials', /incorrect/],
    ['TypeError: Network request failed', /connexion/],
    ['Token has expired or is invalid', /code/],
    ['Password should be at least 8 characters', /faible/],
    ['email rate limit exceeded', /Patientez/],
    ['this report already has a solution', /déjà proposé/],
    ['Not found or not allowed', /pas le droit/],
    ['duplicate key value violates unique constraint', /existe déjà/],
    ['new row violates check constraint', /pas valides/],
  ])('translates "%s"', (message, expected) => {
    expect(friendlyError(new Error(message))).toMatch(expected)
  })

  it('reads the message of plain error objects', () => {
    expect(friendlyError({ message: 'Invalid login credentials' })).toMatch(/incorrect/)
  })

  it('falls back to a generic sentence, also for non-errors', () => {
    expect(friendlyError(new Error('boom'))).toBe('Une erreur est survenue. Réessayez.')
    expect(friendlyError('weird')).toBe('Une erreur est survenue. Réessayez.')
  })
})
