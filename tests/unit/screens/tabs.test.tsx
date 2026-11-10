import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import * as ImagePicker from 'expo-image-picker'
import React from 'react'
import HomeScreen from '@/app/(tabs)/index'
import ReportScreen from '@/app/(tabs)/report'
import SearchScreen from '@/app/(tabs)/search'
import ReportSentScreen from '@/app/report-sent'
import * as api from '@/src/lib/api'
import { card, marie, wifi } from '../../fixtures'
import { router, setParams } from '../../mocks/expoRouter'

jest.mock('@/src/lib/api')
const mocked = jest.mocked(api)

beforeEach(() => {
  jest.clearAllMocks()
  setParams({})
  mocked.getCurrentUser.mockResolvedValue(marie)
  mocked.fetchCategories.mockResolvedValue([
    wifi,
    { ...wifi, BAS_id: 2, BAS_libelle: 'Imprimante', reportCount: 1 },
  ])
  mocked.fetchPopularReports.mockResolvedValue([card()])
  mocked.countUnreadNotifications.mockResolvedValue(2)
  mocked.searchReports.mockResolvedValue([card()])
  mocked.fetchSimilarReports.mockResolvedValue([])
})

describe('HomeScreen', () => {
  it('greets the user and lists categories and popular solutions', async () => {
    await render(<HomeScreen />)
    expect(await screen.findByText('Bonjour Marie,')).toBeOnTheScreen()
    expect(screen.getByText('2 solutions')).toBeOnTheScreen()
    expect(screen.getByText('1 solution')).toBeOnTheScreen()
    expect(screen.getByText('Le wifi se coupe')).toBeOnTheScreen()
    expect(screen.getByRole('button', { name: 'Notifications, 2 nouvelles' })).toBeOnTheScreen()
  })

  it('opens the search filtered on a tapped category, and the notifications', async () => {
    await render(<HomeScreen />)
    await fireEvent.press(await screen.findByRole('button', { name: 'Imprimante, 1 solution' }))
    expect(router.push).toHaveBeenCalledWith({ pathname: '/search', params: { baseId: '2' } })
    await fireEvent.press(screen.getByRole('search'))
    expect(router.push).toHaveBeenCalledWith({ pathname: '/search', params: { focus: '1' } })
    await fireEvent.press(screen.getByRole('button', { name: /Notifications/ }))
    expect(router.push).toHaveBeenCalledWith('/notifications')
  })

  it('offers to retry when loading fails', async () => {
    mocked.fetchCategories.mockRejectedValueOnce(new Error('Network request failed'))
    await render(<HomeScreen />)
    await fireEvent.press(await screen.findByRole('button', { name: 'Réessayer' }))
    expect(mocked.fetchCategories).toHaveBeenCalledTimes(2)
  })
})

describe('SearchScreen', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('searches after a pause in typing and counts results', async () => {
    await render(<SearchScreen />)
    expect(await screen.findByText('1 solution trouvée')).toBeOnTheScreen()
    await fireEvent.changeText(screen.getByLabelText('Votre problème en quelques mots'), 'wifi')
    await act(async () => jest.advanceTimersByTime(300))
    await waitFor(() => expect(mocked.searchReports).toHaveBeenLastCalledWith('wifi', null))
    await fireEvent.press(screen.getByRole('button', { name: 'Effacer' }))
    expect(screen.getByLabelText('Votre problème en quelques mots')).toHaveProp('value', '')
  })

  it('filters by category from the chips and from the route', async () => {
    setParams({ baseId: '2' })
    await render(<SearchScreen />)
    await waitFor(() => expect(mocked.searchReports).toHaveBeenCalledWith('', 2))
    await fireEvent.press(await screen.findByRole('button', { name: 'Internet & Wi-Fi' }))
    await waitFor(() => expect(mocked.searchReports).toHaveBeenLastCalledWith('', 1))
    await fireEvent.press(screen.getByText('Tout'))
    await waitFor(() => expect(mocked.searchReports).toHaveBeenLastCalledWith('', null))
  })

  it('says when nothing is found and offers to report it', async () => {
    mocked.searchReports.mockResolvedValue([])
    await render(<SearchScreen />)
    expect(await screen.findByText('Aucune solution trouvée')).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Signaler ce problème' }))
    expect(router.push).toHaveBeenCalledWith({ pathname: '/report', params: {} })
  })
})

describe('ReportScreen (guided report)', () => {
  /** Goes through steps 1 and 2 with valid answers. */
  async function fillSteps() {
    await fireEvent.press(
      await screen.findByRole('button', { name: 'Internet & Wi-Fi, Réseau, connexion' }),
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }))
    await fireEvent.changeText(screen.getByLabelText('En une phrase'), 'Le wifi coupe')
    await fireEvent.press(screen.getByText('Cette semaine'))
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }))
  }

  it('cannot continue before choosing a type', async () => {
    await render(<ReportScreen />)
    expect(await screen.findByRole('button', { name: 'Continuer' })).toBeDisabled()
  })

  it('checks the title on step 2', async () => {
    await render(<ReportScreen />)
    await fireEvent.press(await screen.findByText('Je ne sais pas / autre chose'))
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }))
    expect(screen.getByText('Écrivez au moins 3 caractères.')).toBeOnTheScreen()
  })

  it('shows similar solutions, then sends the report and resets', async () => {
    mocked.fetchSimilarReports.mockResolvedValue([
      card({ REP_id: 9, REP_libelle: 'Wifi instable' }),
    ])
    mocked.createReport.mockResolvedValue(42)
    await render(<ReportScreen />)
    await fillSteps()
    expect(await screen.findByText('Ces solutions ressemblent à votre problème')).toBeOnTheScreen()
    expect(screen.getByText('Cette semaine')).toBeOnTheScreen()
    await fireEvent.press(screen.getByText('Wifi instable'))
    expect(router.push).toHaveBeenCalledWith({ pathname: '/reports/[id]', params: { id: '9' } })

    await fireEvent.press(screen.getByRole('checkbox'))
    await fireEvent.press(screen.getByRole('button', { name: 'Envoyer mon signalement' }))
    expect(mocked.createReport).toHaveBeenCalledWith({
      REP_libelle: 'Le wifi coupe',
      REP_content: 'Le wifi coupe',
      BAS_id: 1,
      REP_since: 'week',
      REP_notify: false,
      photoUri: null,
    })
    expect(router.push).toHaveBeenCalledWith({ pathname: '/report-sent', params: { id: '42' } })
    expect(await screen.findByText('Étape 1 sur 3')).toBeOnTheScreen()
  })

  it('adds and removes a photo, helps with dictation, and edits from the summary', async () => {
    jest.mocked(ImagePicker.launchImageLibraryAsync).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://shot.jpg' }],
    } as never)
    await render(<ReportScreen />)
    await fireEvent.press(
      await screen.findByRole('button', { name: 'Internet & Wi-Fi, Réseau, connexion' }),
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }))
    await fireEvent.press(screen.getByText('Dicter au lieu d’écrire'))
    expect(screen.getByText('Touchez le micro de votre clavier, puis parlez.')).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Ajouter une photo de l’écran' }))
    expect(await screen.findByText('Photo ajoutée')).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Retirer' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Ajouter une photo de l’écran' }))
    await fireEvent.changeText(await screen.findByLabelText('En une phrase'), 'Le wifi coupe')
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }))
    expect(await screen.findByText('1 photo ajoutée')).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Modifier' }))
    expect(screen.getByText('Étape 2 sur 3')).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Retour' }))
    await fireEvent.press(screen.getByRole('button', { name: 'Retour' }))
    expect(router.back).toHaveBeenCalled()
  })

  it('keeps the form and explains when sending fails', async () => {
    mocked.createReport.mockRejectedValue(new Error('Network request failed'))
    setParams({ title: 'Imprimante bloquée' })
    await render(<ReportScreen />)
    await fireEvent.press(await screen.findByText('Je ne sais pas / autre chose'))
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }))
    expect(screen.getByLabelText('En une phrase')).toHaveProp('value', 'Imprimante bloquée')
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }))
    await fireEvent.press(await screen.findByRole('button', { name: 'Envoyer mon signalement' }))
    expect(await screen.findByText(/Vérifiez votre connexion/)).toBeOnTheScreen()
  })
})

describe('ReportSentScreen', () => {
  it('thanks the user and offers the next steps', async () => {
    setParams({ id: '42' })
    await render(<ReportSentScreen />)
    expect(await screen.findByText(/Merci Marie/)).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('button', { name: 'Voir mon signalement' }))
    expect(router.replace).toHaveBeenCalledWith({ pathname: '/reports/[id]', params: { id: '42' } })
    await fireEvent.press(screen.getByRole('button', { name: 'Retour à l’accueil' }))
    expect(router.replace).toHaveBeenCalledWith('/')
  })
})
