import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import React from 'react'
import { Alert, type AlertButton } from 'react-native'
import SupportScreen from '@/app/support'
import * as api from '@/src/lib/api'
import { card, wifi } from '../../fixtures'
import { router } from '../../mocks/expoRouter'

jest.mock('@/src/lib/api')
const mocked = jest.mocked(api)
const alert = jest.spyOn(Alert, 'alert')

beforeEach(() => {
  jest.clearAllMocks()
  mocked.fetchValidationQueue.mockResolvedValue([
    card({ REP_is_solution_validated: false, REP_solution: 'Redémarrer' }),
  ])
  mocked.fetchUnsolvedReports.mockResolvedValue([
    card({ REP_id: 2, REP_libelle: 'Lent', REP_solution: null }),
  ])
  mocked.fetchOpenCallbacks.mockResolvedValue([
    {
      CB_id: 3,
      user_id: 'u1',
      REP_id: 1,
      CB_phone: '0612345678',
      CB_message: 'Urgent',
      CB_done: false,
      CB_created_at: new Date().toISOString(),
    },
  ])
  mocked.fetchStats.mockResolvedValue({
    total: 10,
    unsolved: 2,
    validated: 5,
    helped: 30,
    openCallbacks: 1,
  })
  mocked.fetchCategories.mockResolvedValue([wifi])
  for (const write of [
    'setSolutionValidated',
    'refuseSolution',
    'closeCallback',
    'createCategory',
    'deleteCategory',
  ] as const) {
    mocked[write].mockResolvedValue()
  }
})

describe('SupportScreen', () => {
  it('validates or refuses proposed solutions', async () => {
    await render(<SupportScreen />)
    expect(await screen.findByText('Redémarrer')).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Valider' }))
    expect(mocked.setSolutionValidated).toHaveBeenCalledWith(1, true)
    await fireEvent.press(screen.getByRole('button', { name: 'Refuser' }))
    expect(mocked.refuseSolution).toHaveBeenCalledWith(1)
    await waitFor(() => expect(mocked.fetchValidationQueue).toHaveBeenCalledTimes(3))
  })

  it('reports failures of admin actions', async () => {
    mocked.refuseSolution.mockRejectedValue(new Error('Not found or not allowed'))
    await render(<SupportScreen />)
    await fireEvent.press(await screen.findByRole('button', { name: 'Refuser' }))
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith('Vous n’avez pas le droit de faire cela.'),
    )
  })

  it('lists unsolved reports and call-backs', async () => {
    await render(<SupportScreen />)
    await fireEvent.press(await screen.findByText('Sans solution (1)'))
    await fireEvent.press(screen.getByRole('button', { name: 'Proposer une solution' }))
    expect(router.push).toHaveBeenCalledWith({ pathname: '/reports/[id]', params: { id: '2' } })
    await fireEvent.press(screen.getByText('Rappels (1)'))
    expect(screen.getByText('0612345678')).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Voir la fiche concernée' }))
    await fireEvent.press(screen.getByRole('button', { name: 'C’est fait' }))
    expect(mocked.closeCallback).toHaveBeenCalledWith(3)
  })

  it('shows empty lists', async () => {
    mocked.fetchValidationQueue.mockResolvedValue([])
    mocked.fetchUnsolvedReports.mockResolvedValue([])
    mocked.fetchOpenCallbacks.mockResolvedValue([])
    await render(<SupportScreen />)
    expect(await screen.findByText('Aucune solution à valider.')).toBeOnTheScreen()
    await fireEvent.press(screen.getByText('Sans solution (0)'))
    expect(screen.getByText('Tous les problèmes ont une solution.')).toBeOnTheScreen()
    await fireEvent.press(screen.getByText('Rappels (0)'))
    expect(screen.getByText('Personne n’attend d’appel.')).toBeOnTheScreen()
  })

  it('shows statistics', async () => {
    await render(<SupportScreen />)
    await fireEvent.press(await screen.findByText('Statistiques'))
    expect(await screen.findByText('personnes aidées')).toBeOnTheScreen()
    expect(screen.getByText('30')).toBeOnTheScreen()
  })

  it('adds and deletes categories', async () => {
    await render(<SupportScreen />)
    await fireEvent.press(await screen.findByText('Catégories'))
    await fireEvent.press(await screen.findByRole('button', { name: 'Ajouter la catégorie' }))
    expect(screen.getByText('Donnez un nom à la catégorie.')).toBeOnTheScreen()
    await fireEvent.changeText(screen.getByLabelText('Nom'), 'Visio')
    await fireEvent.press(screen.getByRole('radio', { name: 'Icône videocam' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Ajouter la catégorie' }))
    expect(mocked.createCategory).toHaveBeenCalledWith('Visio', 'videocam-outline', '')
    await fireEvent.press(screen.getByRole('button', { name: 'Supprimer' }))
    const buttons = alert.mock.calls.at(-1)?.[2] as AlertButton[]
    buttons.find((button) => button.text === 'Supprimer')?.onPress?.()
    await waitFor(() => expect(mocked.deleteCategory).toHaveBeenCalledWith(1))
    mocked.createCategory.mockRejectedValueOnce(new Error('duplicate key value'))
    await fireEvent.changeText(screen.getByLabelText('Nom'), 'Visio')
    await fireEvent.press(screen.getByRole('button', { name: 'Ajouter la catégorie' }))
    expect(await screen.findByText('Cet élément existe déjà.')).toBeOnTheScreen()
  })
})
