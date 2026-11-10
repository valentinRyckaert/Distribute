import { relativeDate, solutionSteps, statusOf } from '@/src/lib/status'

describe('statusOf', () => {
  it('is pending without a solution', () => {
    expect(statusOf({ REP_solution: null, REP_is_solution_validated: false })).toBe('pending')
    expect(statusOf({ REP_solution: '   ', REP_is_solution_validated: true })).toBe('pending')
  })
  it('is resolved with a solution, validated once checked', () => {
    expect(statusOf({ REP_solution: 'Redémarrer', REP_is_solution_validated: false })).toBe(
      'resolved',
    )
    expect(statusOf({ REP_solution: 'Redémarrer', REP_is_solution_validated: true })).toBe(
      'validated',
    )
  })
})

describe('solutionSteps', () => {
  it('splits lines and strips numbering and bullets', () => {
    expect(solutionSteps('1. Éteindre\n\n2) Attendre\n- Rallumer\n• Tester')).toEqual([
      'Éteindre',
      'Attendre',
      'Rallumer',
      'Tester',
    ])
  })
  it('returns no step for an empty solution', () => {
    expect(solutionSteps(null)).toEqual([])
  })
})

describe('relativeDate', () => {
  const now = new Date('2026-11-10T12:00:00Z')
  const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString()
  it.each([
    [0, "aujourd'hui"],
    [1, 'hier'],
    [3, 'il y a 3 jours'],
    [8, 'il y a 1 semaine'],
    [21, 'il y a 3 semaines'],
  ])('%i days ago reads "%s"', (days, expected) => {
    expect(relativeDate(daysAgo(days), now)).toBe(expected)
  })
  it('gives the date past a month', () => {
    expect(relativeDate(daysAgo(60), now)).toMatch(/^le /)
  })
})
