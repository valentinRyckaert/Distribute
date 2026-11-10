import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import AppText from '@/src/components/AppText'
import Badge from '@/src/components/Badge'
import Button from '@/src/components/Button'
import Card from '@/src/components/Card'
import Chip from '@/src/components/Chip'
import IconBubble, { type IconName } from '@/src/components/IconBubble'
import Screen from '@/src/components/Screen'
import StateMessage from '@/src/components/StateMessage'
import TextField from '@/src/components/TextField'
import TopBar from '@/src/components/TopBar'
import {
  closeCallback,
  createCategory,
  deleteCategory,
  fetchCategories,
  fetchOpenCallbacks,
  fetchStats,
  fetchUnsolvedReports,
  fetchValidationQueue,
  refuseSolution,
  setSolutionValidated,
} from '@/src/lib/api'
import { friendlyError } from '@/src/lib/errors'
import { relativeDate } from '@/src/lib/status'
import type { ReportCardData } from '@/src/lib/types'
import { useQuery } from '@/src/lib/useQuery'
import { LIMITS } from '@/src/lib/validation'
import { useTheme } from '@/src/theme/settings'
import { radius, spacing } from '@/src/theme/tokens'

type Tab = 'validate' | 'unsolved' | 'callbacks' | 'stats' | 'categories'

/** Icons an admin can choose for a new category. */
const CATEGORY_ICONS: IconName[] = [
  'wifi-outline',
  'print-outline',
  'desktop-outline',
  'key-outline',
  'mail-outline',
  'apps-outline',
  'phone-portrait-outline',
  'videocam-outline',
  'cloud-outline',
  'help-circle-outline',
]

/**
 * Support space (admins only; the database refuses these actions to others):
 * validation queue, unsolved reports, call-backs, statistics and categories.
 */
export default function SupportScreen() {
  const { colors } = useTheme()
  const [tab, setTab] = useState<Tab>('validate')
  const queue = useQuery(fetchValidationQueue)
  const unsolved = useQuery(fetchUnsolvedReports)
  const callbacks = useQuery(fetchOpenCallbacks)

  /** Runs an admin action and reloads the lists. */
  function act(action: Promise<void>) {
    action
      .then(() => {
        queue.reload()
        unsolved.reload()
        callbacks.reload()
      })
      .catch((err: unknown) => Alert.alert(friendlyError(err)))
  }

  const tabs: [Tab, string][] = [
    ['validate', `À valider (${queue.data?.length ?? 0})`],
    ['unsolved', `Sans solution (${unsolved.data?.length ?? 0})`],
    ['callbacks', `Rappels (${callbacks.data?.length ?? 0})`],
    ['stats', 'Statistiques'],
    ['categories', 'Catégories'],
  ]

  return (
    <Screen>
      <TopBar />
      <View style={styles.heading}>
        <AppText variant="titleLarge" accessibilityRole="header">
          Espace support
        </AppText>
        <AppText variant="bodyLarge" color="textSecondary">
          Vérifiez les solutions proposées par vos collègues avant qu’elles soient mises en avant.
        </AppText>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {tabs.map(([value, label]) => (
          <Chip key={value} label={label} selected={tab === value} onPress={() => setTab(value)} />
        ))}
      </ScrollView>

      {tab === 'validate' && (
        <>
          <StateMessage
            loading={queue.loading && !queue.data}
            error={queue.error}
            onRetry={queue.reload}
            empty={queue.data?.length === 0 ? 'Aucune solution à valider.' : undefined}
          />
          {queue.data?.map((report) => (
            <SupportCard key={report.REP_id} report={report}>
              <View style={[styles.solution, { backgroundColor: colors.bgSubtle }]}>
                <AppText variant="caption" color="textSecondary">
                  Solution proposée
                </AppText>
                <AppText>{report.REP_solution}</AppText>
              </View>
              <View style={styles.row}>
                <Button
                  style={styles.flex}
                  icon="checkmark-circle-outline"
                  label="Valider"
                  onPress={() => act(setSolutionValidated(report.REP_id, true))}
                />
                <Button
                  style={styles.flex}
                  variant="danger"
                  icon="close"
                  label="Refuser"
                  onPress={() => act(refuseSolution(report.REP_id))}
                />
              </View>
            </SupportCard>
          ))}
        </>
      )}

      {tab === 'unsolved' && (
        <>
          <StateMessage
            loading={unsolved.loading && !unsolved.data}
            error={unsolved.error}
            onRetry={unsolved.reload}
            empty={unsolved.data?.length === 0 ? 'Tous les problèmes ont une solution.' : undefined}
          />
          {unsolved.data?.map((report) => (
            <SupportCard key={report.REP_id} report={report}>
              <Badge report={report} />
              <Button
                variant="secondary"
                icon="create-outline"
                label="Proposer une solution"
                onPress={() =>
                  router.push({ pathname: '/reports/[id]', params: { id: String(report.REP_id) } })
                }
              />
            </SupportCard>
          ))}
        </>
      )}

      {tab === 'callbacks' && (
        <>
          <StateMessage
            loading={callbacks.loading && !callbacks.data}
            error={callbacks.error}
            onRetry={callbacks.reload}
            empty={callbacks.data?.length === 0 ? 'Personne n’attend d’appel.' : undefined}
          />
          {callbacks.data?.map((callback) => (
            <Card key={callback.CB_id}>
              <AppText variant="caption" color="textSecondary">
                Demandé {relativeDate(callback.CB_created_at)}
              </AppText>
              <AppText variant="titleSmall" selectable>
                {callback.CB_phone}
              </AppText>
              {!!callback.CB_message && <AppText>{callback.CB_message}</AppText>}
              {callback.REP_id && (
                <Button
                  variant="tertiary"
                  label="Voir la fiche concernée"
                  onPress={() =>
                    router.push({
                      pathname: '/reports/[id]',
                      params: { id: String(callback.REP_id) },
                    })
                  }
                />
              )}
              <Button
                icon="checkmark-circle-outline"
                label="C’est fait"
                onPress={() => act(closeCallback(callback.CB_id))}
              />
            </Card>
          ))}
        </>
      )}

      {tab === 'stats' && <Stats />}
      {tab === 'categories' && <Categories />}
    </Screen>
  )
}

/** A report summary for the support lists, with actions below. */
function SupportCard({ report, children }: { report: ReportCardData; children: React.ReactNode }) {
  return (
    <Card>
      <View style={styles.row}>
        <IconBubble name={(report.Base?.BAS_icon ?? 'help-circle-outline') as IconName} size={32} />
        <AppText variant="caption" color="textSecondary">
          {report.Base?.BAS_libelle ?? 'Autre'} · signalé {relativeDate(report.REP_created_at)}
        </AppText>
      </View>
      <AppText variant="titleSmall">{report.REP_libelle}</AppText>
      {children}
    </Card>
  )
}

/** Key figures. */
function Stats() {
  const { colors } = useTheme()
  const stats = useQuery(fetchStats)
  if (!stats.data)
    return <StateMessage loading={stats.loading} error={stats.error} onRetry={stats.reload} />
  const figures: [number, string][] = [
    [stats.data.total, 'signalements'],
    [stats.data.unsolved, 'sans solution'],
    [stats.data.validated, 'solutions validées'],
    [stats.data.helped, 'personnes aidées'],
    [stats.data.openCallbacks, 'rappels en attente'],
  ]
  return (
    <View style={styles.grid}>
      {figures.map(([value, label]) => (
        <View
          key={label}
          style={[styles.figure, { backgroundColor: colors.bgBrandSoft }]}
          accessible
        >
          <AppText variant="display" color="textBrand">
            {value}
          </AppText>
          <AppText variant="labelMedium" color="textBrand">
            {label}
          </AppText>
        </View>
      ))}
    </View>
  )
}

/** Category list with deletion, and a form to add one. */
function Categories() {
  const { colors } = useTheme()
  const categories = useQuery(fetchCategories)
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<IconName>(CATEGORY_ICONS[0])
  const [error, setError] = useState<string | null>(null)

  /** Creates the category from the form. */
  async function add() {
    if (!label.trim()) {
      setError('Donnez un nom à la catégorie.')
      return
    }
    try {
      await createCategory(label, icon, description)
      setLabel('')
      setDescription('')
      setError(null)
      categories.reload()
    } catch (err) {
      setError(friendlyError(err))
    }
  }

  /** Asks for confirmation, then deletes the category. */
  function confirmDelete(id: number, name: string) {
    Alert.alert(`Supprimer « ${name} » ?`, 'Ses signalements resteront, sans catégorie.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () =>
          deleteCategory(id)
            .then(categories.reload)
            .catch((err: unknown) => Alert.alert(friendlyError(err))),
      },
    ])
  }

  return (
    <>
      <StateMessage
        loading={categories.loading && !categories.data}
        error={categories.error}
        onRetry={categories.reload}
      />
      {categories.data?.map((category) => (
        <Card key={category.BAS_id} style={styles.row}>
          <IconBubble name={category.BAS_icon as IconName} />
          <View style={styles.flex}>
            <AppText variant="labelLarge">{category.BAS_libelle}</AppText>
            <AppText variant="caption" color="textSecondary">
              {category.reportCount} signalement{category.reportCount > 1 ? 's' : ''}
            </AppText>
          </View>
          <Button
            variant="danger"
            icon="trash-outline"
            label="Supprimer"
            onPress={() => confirmDelete(category.BAS_id, category.BAS_libelle)}
          />
        </Card>
      ))}
      <Card background="bgSubtle">
        <AppText variant="titleSmall">Nouvelle catégorie</AppText>
        <TextField label="Nom" value={label} onChangeText={setLabel} maxLength={LIMITS.labelMax} />
        <TextField
          label="Exemples (facultatif)"
          placeholder="Réseau, connexion"
          value={description}
          onChangeText={setDescription}
          maxLength={80}
          error={error}
        />
        <AppText variant="labelMedium">Icône</AppText>
        <View style={styles.icons}>
          {CATEGORY_ICONS.map((name) => (
            <Pressable
              key={name}
              accessibilityRole="radio"
              accessibilityLabel={`Icône ${name.replace('-outline', '')}`}
              accessibilityState={{ selected: icon === name }}
              onPress={() => setIcon(name)}
              style={[
                styles.iconChoice,
                { borderColor: icon === name ? colors.borderFocus : 'transparent' },
              ]}
            >
              <IconBubble name={name} size={44} />
            </Pressable>
          ))}
        </View>
        <Button icon="add-circle-outline" label="Ajouter la catégorie" onPress={add} />
      </Card>
    </>
  )
}

const styles = StyleSheet.create({
  heading: { gap: spacing.sm },
  chips: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
  solution: { padding: spacing.md, borderRadius: radius.md, gap: spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  figure: { flexBasis: '47%', flexGrow: 1, padding: spacing.lg, borderRadius: radius.lg },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  iconChoice: { borderWidth: 2.5, borderRadius: radius.full, padding: 2 },
})
