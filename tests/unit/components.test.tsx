import { fireEvent, render, screen } from '@testing-library/react-native'
import * as Speech from 'expo-speech'
import React from 'react'
import { Text } from 'react-native'
import Badge from '@/src/components/Badge'
import Button from '@/src/components/Button'
import CategoryTile from '@/src/components/CategoryTile'
import Chip from '@/src/components/Chip'
import HelpCard from '@/src/components/HelpCard'
import ListRow from '@/src/components/ListRow'
import ReportCard from '@/src/components/ReportCard'
import SectionHeader from '@/src/components/SectionHeader'
import SolutionStep from '@/src/components/SolutionStep'
import StateMessage from '@/src/components/StateMessage'
import StepIndicator from '@/src/components/StepIndicator'
import TextField from '@/src/components/TextField'
import ToggleRow from '@/src/components/ToggleRow'
import TopBar from '@/src/components/TopBar'
import type { ReportCardData } from '@/src/lib/types'
import { router } from '../mocks/expoRouter'

const report = {
  REP_id: 4,
  REP_libelle: 'Le wifi se coupe',
  REP_content: 'Depuis ce matin',
  REP_solution: null,
  REP_is_solution_validated: false,
  REP_helped_count: 0,
  REP_created_at: new Date().toISOString(),
  Base: {
    BAS_id: 1,
    BAS_libelle: 'Internet & Wi-Fi',
    BAS_icon: 'wifi-outline',
    BAS_description: '',
  },
} as ReportCardData

beforeEach(() => jest.clearAllMocks())

describe('Button', () => {
  it('calls onPress and exposes its label', async () => {
    const onPress = jest.fn()
    await render(<Button label="Continuer" icon="arrow-forward" onPress={onPress} />)
    await fireEvent.press(screen.getByRole('button', { name: 'Continuer' }))
    expect(onPress).toHaveBeenCalled()
  })

  it('does nothing while disabled or loading', async () => {
    const onPress = jest.fn()
    await render(
      <>
        <Button label="A" disabled onPress={onPress} />
        <Button label="B" loading variant="danger" onPress={onPress} />
      </>,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'A' }))
    await fireEvent.press(screen.getByRole('button', { name: 'B' }))
    expect(onPress).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'B' })).toBeBusy()
  })
})

describe('TextField', () => {
  it('shows the helper, then the error instead', async () => {
    const { rerender } = await render(<TextField label="E-mail" helper="Celle du travail" />)
    expect(screen.getByText('Celle du travail')).toBeOnTheScreen()
    await rerender(<TextField label="E-mail" helper="Celle du travail" error="Obligatoire" />)
    expect(screen.getByText('Obligatoire')).toBeOnTheScreen()
    expect(screen.queryByText('Celle du travail')).toBeNull()
  })

  it('shows and hides a secret value with the eye button', async () => {
    await render(<TextField label="Mot de passe" secret value="abc" />)
    expect(screen.getByLabelText('Mot de passe')).toHaveProp('secureTextEntry', true)
    await fireEvent.press(screen.getByRole('button', { name: 'Afficher le mot de passe' }))
    expect(screen.getByLabelText('Mot de passe')).toHaveProp('secureTextEntry', false)
  })

  it('forwards focus and blur', async () => {
    const onFocus = jest.fn()
    const onBlur = jest.fn()
    await render(<TextField label="Nom" onFocus={onFocus} onBlur={onBlur} multiline />)
    await fireEvent(screen.getByLabelText('Nom'), 'focus')
    await fireEvent(screen.getByLabelText('Nom'), 'blur')
    expect(onFocus).toHaveBeenCalled()
    expect(onBlur).toHaveBeenCalled()
  })
})

describe('Chip and Badge', () => {
  it('marks the selected chip', async () => {
    const onPress = jest.fn()
    await render(<Chip label="Tout" selected onPress={onPress} />)
    expect(screen.getByRole('button', { name: /Tout/ })).toBeSelected()
    await fireEvent.press(screen.getByText('Tout'))
    expect(onPress).toHaveBeenCalled()
  })

  it.each([
    [{ REP_solution: null, REP_is_solution_validated: false }, 'En attente de solution'],
    [{ REP_solution: 'x', REP_is_solution_validated: false }, 'Résolu'],
    [{ REP_solution: 'x', REP_is_solution_validated: true }, 'Validé par le support'],
  ])('labels the status in words', async (status, label) => {
    await render(<Badge report={status} />)
    expect(screen.getByText(label)).toBeOnTheScreen()
  })
})

describe('ReportCard', () => {
  it('summarises the report and opens it', async () => {
    await render(<ReportCard report={report} showDate />)
    expect(screen.getByText("Internet & Wi-Fi · aujourd'hui")).toBeOnTheScreen()
    expect(screen.getByText('Aucune réponse pour l’instant')).toBeOnTheScreen()
    await fireEvent.press(screen.getByText('Le wifi se coupe'))
    expect(router.push).toHaveBeenCalledWith({ pathname: '/reports/[id]', params: { id: '4' } })
  })

  it('counts people helped, with a category fallback', async () => {
    await render(<ReportCard report={{ ...report, Base: null, REP_helped_count: 2 }} />)
    expect(screen.getByText('2 personnes aidées')).toBeOnTheScreen()
    expect(screen.getByText('Autre')).toBeOnTheScreen()
  })
})

describe('small components', () => {
  it('SolutionStep toggles and announces its state', async () => {
    const onToggle = jest.fn()
    const { rerender } = await render(
      <SolutionStep number={2} text="Redémarrer" done={false} onToggle={onToggle} />,
    )
    expect(screen.getByText('2')).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole('checkbox'))
    expect(onToggle).toHaveBeenCalled()
    await rerender(<SolutionStep number={2} text="Redémarrer" done onToggle={onToggle} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('StepIndicator says where we are', async () => {
    await render(<StepIndicator current={2} total={3} />)
    expect(screen.getByText('Étape 2 sur 3')).toBeOnTheScreen()
  })

  it('ListRow shows a count and reacts to presses', async () => {
    const onPress = jest.fn()
    await render(
      <ListRow
        icon="notifications-outline"
        label="Notifications"
        count={3}
        onPress={onPress}
        danger
      />,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Notifications, 3 nouveaux' }))
    expect(onPress).toHaveBeenCalled()
  })

  it('CategoryTile reads label and detail together', async () => {
    const onPress = jest.fn()
    await render(
      <CategoryTile
        label="Imprimante"
        icon="print-outline"
        detail="8 solutions"
        selected
        onPress={onPress}
      />,
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Imprimante, 8 solutions' }))
    expect(onPress).toHaveBeenCalled()
  })

  it('ToggleRow switches', async () => {
    const onChange = jest.fn()
    await render(
      <ToggleRow
        label="Contraste renforcé"
        description="Plus foncé"
        value={false}
        onChange={onChange}
      />,
    )
    await fireEvent(screen.getByLabelText('Contraste renforcé'), 'valueChange', true)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('HelpCard opens the call-back screen with the report', async () => {
    await render(<HelpCard reportId={5} />)
    await fireEvent.press(screen.getByRole('button', { name: 'Être rappelé par le support' }))
    expect(router.push).toHaveBeenCalledWith({ pathname: '/callback', params: { reportId: 5 } })
  })

  it('SectionHeader links to everything', async () => {
    await render(
      <SectionHeader title="Solutions populaires" subtitle="Les plus utiles" seeAll="/search" />,
    )
    await fireEvent.press(screen.getByText('Tout voir'))
    expect(router.push).toHaveBeenCalledWith('/search')
  })

  it('StateMessage shows error with retry, loading, empty', async () => {
    const onRetry = jest.fn()
    const { rerender } = await render(<StateMessage error="Oups" onRetry={onRetry} />)
    await fireEvent.press(screen.getByRole('button', { name: 'Réessayer' }))
    expect(onRetry).toHaveBeenCalled()
    await rerender(<StateMessage loading />)
    expect(screen.getByLabelText('Chargement')).toBeOnTheScreen()
    await rerender(<StateMessage empty="Rien" />)
    expect(screen.getByText('Rien')).toBeOnTheScreen()
    await rerender(<StateMessage />)
    expect(screen.toJSON()).toBeNull()
  })
})

describe('TopBar', () => {
  it('goes back, or home when there is no history', async () => {
    await render(<TopBar />)
    await fireEvent.press(screen.getByRole('button', { name: 'Retour' }))
    expect(router.back).toHaveBeenCalled()
    router.canGoBack.mockReturnValueOnce(false)
    await fireEvent.press(screen.getByRole('button', { name: 'Retour' }))
    expect(router.replace).toHaveBeenCalledWith('/')
  })

  it('reads the page aloud in French and stops', async () => {
    await render(<TopBar listenText="Bonjour" action={<Text>extra</Text>} />)
    await fireEvent.press(screen.getByRole('button', { name: 'Écouter cette page' }))
    expect(Speech.speak).toHaveBeenCalledWith(
      'Bonjour',
      expect.objectContaining({ language: 'fr-FR' }),
    )
    await fireEvent.press(screen.getByRole('button', { name: 'Arrêter la lecture' }))
    expect(Speech.stop).toHaveBeenCalled()
  })

  it('hides the listen button without text', async () => {
    const onBack = jest.fn()
    await render(<TopBar onBack={onBack} />)
    expect(screen.queryByText('Écouter')).toBeNull()
    await fireEvent.press(screen.getByRole('button', { name: 'Retour' }))
    expect(onBack).toHaveBeenCalled()
  })
})
