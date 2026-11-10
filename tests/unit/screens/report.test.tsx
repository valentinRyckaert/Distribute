import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import React from 'react'
import { Alert, type AlertButton } from 'react-native'
import ReportDetailScreen from '@/app/reports/[id]/index'
import EditReportScreen from '@/app/reports/[id]/edit'
import * as api from '@/src/lib/api'
import { admin, card, makeReport, marie, wifi } from '../../fixtures'
import { router, setParams } from '../../mocks/expoRouter'

jest.mock('@/src/lib/api')
const mocked = jest.mocked(api)
const alert = jest.spyOn(Alert, 'alert')

/** Presses the button with this text in the last alert shown. */
function pressAlertButton(text: string) {
  const buttons = alert.mock.calls.at(-1)?.[2] as AlertButton[]
  buttons.find((button) => button.text === text)?.onPress?.()
}

beforeEach(() => {
  jest.clearAllMocks()
  setParams({ id: '1' })
  mocked.fetchReport.mockResolvedValue(makeReport())
  mocked.getCurrentUser.mockResolvedValue(marie)
  mocked.fetchFavorites.mockResolvedValue([])
  mocked.fetchMyFeedback.mockResolvedValue(null)
  mocked.fetchCategories.mockResolvedValue([wifi])
  mocked.getPhotoUrl.mockResolvedValue('https://signed/photo')
  for (const write of [
    'deleteReport',
    'setSolutionValidated',
    'refuseSolution',
    'markDuplicate',
  ] as const) {
    mocked[write].mockResolvedValue()
  }
})

describe('report detail', () => {
  it('shows the problem and the steps to tick', async () => {
    await render(<ReportDetailScreen />)
    expect(await screen.findByText('Le wifi se coupe')).toBeOnTheScreen()
    const steps = screen.getAllByRole('checkbox')
    expect(steps).toHaveLength(2)
    await fireEvent.press(steps[0])
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked()
    await fireEvent.press(screen.getAllByRole('checkbox')[0])
    expect(screen.getAllByRole('checkbox')[0]).not.toBeChecked()
  })

  it('says when the report does not exist', async () => {
    mocked.fetchReport.mockResolvedValue(null)
    await render(<ReportDetailScreen />)
    expect(
      await screen.findByText('Cette fiche n’existe pas ou a été supprimée.'),
    ).toBeOnTheScreen()
  })

  it('records whether it worked', async () => {
    await render(<ReportDetailScreen />)
    mocked.fetchMyFeedback.mockResolvedValue(true)
    await fireEvent.press(await screen.findByRole('button', { name: 'Oui !' }))
    expect(mocked.sendFeedback).toHaveBeenCalledWith(1, true)
    expect(await screen.findByText('Merci ! Votre réponse aide vos collègues.')).toBeOnTheScreen()
    mocked.fetchMyFeedback.mockResolvedValue(false)
    await fireEvent.press(screen.getByRole('button', { name: 'Non' }))
    expect(await screen.findByText(/Dommage/)).toBeOnTheScreen()
    mocked.sendFeedback.mockRejectedValueOnce(new Error('boom'))
    await fireEvent.press(screen.getByRole('button', { name: 'Non' }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith('Une erreur est survenue. Réessayez.'))
  })

  it('keeps and forgets the report', async () => {
    await render(<ReportDetailScreen />)
    await fireEvent.press(await screen.findByRole('button', { name: 'Garder cette fiche' }))
    expect(mocked.setFavorite).toHaveBeenCalledWith(1, true)
    mocked.setFavorite.mockRejectedValueOnce(new Error('Network request failed'))
    await fireEvent.press(screen.getByRole('button', { name: 'Garder cette fiche' }))
    await waitFor(() => expect(alert).toHaveBeenCalledWith(expect.stringMatching(/connexion/)))
  })

  it('lets anyone propose a solution when there is none', async () => {
    mocked.fetchReport.mockResolvedValue(makeReport({ REP_solution: null, user_id: 'other' }))
    await render(<ReportDetailScreen />)
    await fireEvent.press(await screen.findByRole('button', { name: 'Proposer une solution' }))
    expect(screen.getByText('Ce champ est obligatoire.')).toBeOnTheScreen()
    await fireEvent.changeText(screen.getByLabelText('Votre solution'), 'Redémarrer')
    await fireEvent.press(screen.getByRole('button', { name: 'Proposer une solution' }))
    expect(mocked.proposeSolution).toHaveBeenCalledWith(1, 'Redémarrer')
    expect(screen.queryByRole('button', { name: 'Modifier' })).toBeNull()
  })

  it('explains a refused proposal', async () => {
    mocked.fetchReport.mockResolvedValue(makeReport({ REP_solution: null }))
    mocked.proposeSolution.mockRejectedValue(new Error('this report already has a solution'))
    await render(<ReportDetailScreen />)
    await fireEvent.changeText(await screen.findByLabelText('Votre solution'), 'x')
    await fireEvent.press(screen.getByRole('button', { name: 'Proposer une solution' }))
    expect(await screen.findByText(/déjà proposé/)).toBeOnTheScreen()
  })

  it('adds a comment', async () => {
    mocked.fetchReport.mockResolvedValue(
      makeReport({
        Comment: [
          {
            COM_id: 1,
            REP_id: 1,
            user_id: 'u1',
            COM_content: 'Merci',
            COM_created_at: new Date().toISOString(),
          },
          {
            COM_id: 2,
            REP_id: 1,
            user_id: 'x',
            COM_content: 'Pareil',
            COM_created_at: new Date().toISOString(),
          },
        ],
      }),
    )
    await render(<ReportDetailScreen />)
    expect(await screen.findByText("Vous · aujourd'hui")).toBeOnTheScreen()
    expect(screen.getByText("Un collègue · aujourd'hui")).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Publier' }))
    expect(mocked.addComment).not.toHaveBeenCalled()
    await fireEvent.changeText(screen.getByLabelText('Ajouter un commentaire'), 'Ça marche')
    await fireEvent.press(screen.getByRole('button', { name: 'Publier' }))
    expect(mocked.addComment).toHaveBeenCalledWith(1, 'Ça marche')
    mocked.addComment.mockRejectedValueOnce(new Error('boom'))
    await fireEvent.changeText(screen.getByLabelText('Ajouter un commentaire'), 'Encore')
    await fireEvent.press(screen.getByRole('button', { name: 'Publier' }))
    expect(await screen.findByText('Une erreur est survenue. Réessayez.')).toBeOnTheScreen()
  })

  it('lets the author edit and delete after confirmation', async () => {
    await render(<ReportDetailScreen />)
    await fireEvent.press(await screen.findByRole('button', { name: 'Modifier' }))
    expect(router.push).toHaveBeenCalledWith({
      pathname: '/reports/[id]/edit',
      params: { id: '1' },
    })
    await fireEvent.press(screen.getByRole('button', { name: 'Supprimer' }))
    pressAlertButton('Supprimer')
    await waitFor(() => expect(mocked.deleteReport).toHaveBeenCalledWith(1))
    await waitFor(() => expect(router.back).toHaveBeenCalled())
  })

  it('shows the photo and the duplicate banner', async () => {
    mocked.fetchReport.mockResolvedValue(
      makeReport({ REP_photo_path: 'u1/1.jpg', REP_duplicate_of: 5 }),
    )
    await render(<ReportDetailScreen />)
    expect(await screen.findByLabelText('Photo jointe au signalement')).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Voir la fiche d’origine' }))
    expect(router.replace).toHaveBeenCalledWith({ pathname: '/reports/[id]', params: { id: '5' } })
  })

  it('gives admins the support actions', async () => {
    mocked.getCurrentUser.mockResolvedValue(admin)
    mocked.fetchReport.mockResolvedValue(makeReport({ REP_is_solution_validated: false }))
    mocked.fetchSimilarReports.mockResolvedValue([
      card(),
      card({ REP_id: 8, REP_libelle: 'Wifi lent' }),
    ])
    await render(<ReportDetailScreen />)
    await fireEvent.press(await screen.findByRole('button', { name: 'Valider' }))
    expect(mocked.setSolutionValidated).toHaveBeenCalledWith(1, true)
    await fireEvent.press(screen.getByRole('button', { name: 'Refuser' }))
    expect(mocked.refuseSolution).toHaveBeenCalledWith(1)
    await fireEvent.press(screen.getByRole('button', { name: 'C’est un doublon…' }))
    await fireEvent.press(await screen.findByRole('button', { name: 'Doublon de : Wifi lent' }))
    expect(mocked.markDuplicate).toHaveBeenCalledWith(1, 8)
  })

  it('tells the admin when no similar report exists', async () => {
    mocked.getCurrentUser.mockResolvedValue(admin)
    mocked.fetchSimilarReports.mockResolvedValue([card()])
    await render(<ReportDetailScreen />)
    expect(await screen.findByRole('button', { name: 'Retirer la validation' })).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'C’est un doublon…' }))
    expect(await screen.findByText('Aucune fiche ressemblante trouvée.')).toBeOnTheScreen()
  })
})

describe('edit report', () => {
  it('saves the changes and goes back', async () => {
    await render(<EditReportScreen />)
    await fireEvent.changeText(
      await screen.findByLabelText('En une phrase'),
      'Wifi coupé en réunion',
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Je ne sais pas' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(mocked.updateReport).toHaveBeenCalledWith(1, {
      REP_libelle: 'Wifi coupé en réunion',
      REP_content: 'Depuis ce matin',
      REP_solution: 'Oublier le réseau\nSe reconnecter',
      BAS_id: null,
    })
    await waitFor(() => expect(router.back).toHaveBeenCalled())
  })

  it('validates the fields and shows refusals', async () => {
    mocked.updateReport.mockRejectedValue(new Error('Not found or not allowed'))
    await render(<EditReportScreen />)
    await fireEvent.changeText(await screen.findByLabelText('En une phrase'), 'a')
    await fireEvent.press(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(screen.getByText('Écrivez au moins 3 caractères.')).toBeOnTheScreen()
    await fireEvent.changeText(screen.getByLabelText('En une phrase'), 'abc')
    await fireEvent.press(screen.getByText('Internet & Wi-Fi'))
    await fireEvent.press(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(await screen.findByText('Vous n’avez pas le droit de faire cela.')).toBeOnTheScreen()
  })

  it('says when the report is missing', async () => {
    mocked.fetchReport.mockResolvedValue(null)
    await render(<EditReportScreen />)
    expect(
      await screen.findByText('Cette fiche n’existe pas ou a été supprimée.'),
    ).toBeOnTheScreen()
  })
})
