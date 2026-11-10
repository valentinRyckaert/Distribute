import Ionicons from '@expo/vector-icons/Ionicons'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native'
import AppText from '@/src/components/AppText'
import Badge from '@/src/components/Badge'
import Button from '@/src/components/Button'
import Card from '@/src/components/Card'
import HelpCard from '@/src/components/HelpCard'
import IconBubble, { type IconName } from '@/src/components/IconBubble'
import Screen from '@/src/components/Screen'
import SolutionStep from '@/src/components/SolutionStep'
import StateMessage from '@/src/components/StateMessage'
import TextField from '@/src/components/TextField'
import TopBar from '@/src/components/TopBar'
import {
  addComment,
  deleteReport,
  fetchFavorites,
  fetchMyFeedback,
  fetchReport,
  fetchSimilarReports,
  getCurrentUser,
  getPhotoUrl,
  markDuplicate,
  proposeSolution,
  refuseSolution,
  sendFeedback,
  setFavorite,
  setSolutionValidated,
} from '@/src/lib/api'
import { friendlyError } from '@/src/lib/errors'
import { relativeDate, solutionSteps } from '@/src/lib/status'
import type { CurrentUser, ReportDetail } from '@/src/lib/types'
import { useQuery } from '@/src/lib/useQuery'
import { LIMITS, validateText } from '@/src/lib/validation'
import { useTheme } from '@/src/theme/settings'
import { radius, spacing } from '@/src/theme/tokens'

/**
 * A report and its solution: steps to tick, "did it work?", comments, proposing a solution,
 * and the author's and support's actions.
 */
export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const reportId = Number(id)
  const report = useQuery(() => fetchReport(reportId), [reportId])
  const user = useQuery(getCurrentUser)
  const favorites = useQuery(fetchFavorites)
  const [done, setDone] = useState<number[]>([])
  const data = report.data

  if (!data) {
    return (
      <Screen>
        <TopBar />
        <StateMessage
          loading={report.loading}
          error={report.error}
          onRetry={report.reload}
          empty="Cette fiche n’existe pas ou a été supprimée."
        />
      </Screen>
    )
  }

  const steps = solutionSteps(data.REP_solution)
  const isFavorite = !!favorites.data?.some((favorite) => favorite.REP_id === reportId)
  const listenText = [
    data.REP_libelle,
    'Le problème.',
    data.REP_content,
    ...(steps.length ? ['La solution.', ...steps.map((step, i) => `Étape ${i + 1}. ${step}`)] : []),
  ].join(' ')

  /** Keeps or forgets the report; kept reports can be read offline. */
  async function toggleFavorite() {
    try {
      await setFavorite(reportId, !isFavorite)
      favorites.reload()
    } catch (err) {
      Alert.alert(friendlyError(err))
    }
  }

  return (
    <Screen>
      <TopBar
        listenText={listenText}
        action={<FavoriteButton kept={isFavorite} onPress={toggleFavorite} />}
      />

      {data.REP_duplicate_of && (
        <Card background="bgWarningSoft">
          <AppText>
            Ce problème a déjà été signalé. La solution se trouve sur la fiche d’origine.
          </AppText>
          <Button
            variant="secondary"
            label="Voir la fiche d’origine"
            onPress={() =>
              router.replace({
                pathname: '/reports/[id]',
                params: { id: String(data.REP_duplicate_of) },
              })
            }
          />
        </Card>
      )}

      <View style={styles.block}>
        <View style={styles.row}>
          <IconBubble name={(data.Base?.BAS_icon ?? 'help-circle-outline') as IconName} size={36} />
          <AppText variant="caption" color="textSecondary">
            {data.Base?.BAS_libelle ?? 'Autre'}
          </AppText>
        </View>
        <AppText variant="titleLarge" accessibilityRole="header">
          {data.REP_libelle}
        </AppText>
        <View style={[styles.row, styles.wrap]}>
          <Badge report={data} />
          <AppText variant="caption" color="textSecondary">
            Signalé {relativeDate(data.REP_created_at)}
          </AppText>
        </View>
      </View>

      <View style={styles.block}>
        <AppText variant="titleSmall">Le problème</AppText>
        <AppText variant="bodyLarge">{data.REP_content}</AppText>
        {data.REP_photo_path && <ReportPhoto path={data.REP_photo_path} />}
      </View>

      {steps.length > 0 ? (
        <View style={styles.block}>
          <AppText variant="titleSmall">La solution, étape par étape</AppText>
          <AppText variant="bodyMedium" color="textSecondary">
            Touchez une étape quand vous l’avez faite.
          </AppText>
          {steps.map((step, index) => (
            <SolutionStep
              key={index}
              number={index + 1}
              text={step}
              done={done.includes(index)}
              onToggle={() =>
                setDone(done.includes(index) ? done.filter((i) => i !== index) : [...done, index])
              }
            />
          ))}
          <FeedbackCard reportId={reportId} onAnswered={report.reload} />
        </View>
      ) : (
        <ProposeSolution reportId={reportId} onProposed={report.reload} />
      )}

      {user.data && <OwnerActions report={data} user={user.data} />}
      {user.data?.isAdmin && <SupportActions report={data} onChanged={report.reload} />}

      <Comments report={data} user={user.data ?? undefined} onAdded={report.reload} />
      <HelpCard reportId={reportId} />
    </Screen>
  )
}

/** Bookmark button of the top bar. */
function FavoriteButton({ kept, onPress }: { kept: boolean; onPress: () => void }) {
  const { colors } = useTheme()
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={kept ? 'Ne plus garder cette fiche' : 'Garder cette fiche'}
      accessibilityState={{ selected: kept }}
      onPress={onPress}
      style={[
        styles.iconButton,
        { borderColor: colors.borderDefault, backgroundColor: colors.bgSurface },
      ]}
    >
      <Ionicons name={kept ? 'bookmark' : 'bookmark-outline'} size={22} color={colors.iconBrand} />
    </Pressable>
  )
}

/** The attached photo, loaded through a temporary signed link. */
function ReportPhoto({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    getPhotoUrl(path)
      .then(setUrl)
      .catch(() => setUrl(null))
  }, [path])
  if (!url) return null
  return (
    <Image
      source={{ uri: url }}
      style={styles.photo}
      resizeMode="contain"
      accessibilityLabel="Photo jointe au signalement"
    />
  )
}

/** "Est-ce que ça a marché ?" with Yes / No; the answer can be changed. */
function FeedbackCard({ reportId, onAnswered }: { reportId: number; onAnswered: () => void }) {
  const answer = useQuery(() => fetchMyFeedback(reportId), [reportId])

  /** Saves the answer and refreshes the "people helped" counter. */
  async function answerWith(worked: boolean) {
    try {
      await sendFeedback(reportId, worked)
      answer.reload()
      onAnswered()
    } catch (err) {
      Alert.alert(friendlyError(err))
    }
  }

  return (
    <Card>
      <AppText variant="titleSmall">Est-ce que ça a marché ?</AppText>
      <AppText color="textSecondary" accessibilityLiveRegion="polite">
        {answer.data === true
          ? 'Merci ! Votre réponse aide vos collègues.'
          : answer.data === false
            ? 'Dommage. Le support peut vous rappeler, voir plus bas.'
            : 'Votre réponse aide vos collègues.'}
      </AppText>
      <View style={styles.row}>
        <Button
          style={styles.flex}
          icon="thumbs-up-outline"
          label="Oui !"
          variant={answer.data === true ? 'primary' : 'secondary'}
          onPress={() => answerWith(true)}
        />
        <Button
          style={styles.flex}
          label="Non"
          variant={answer.data === false ? 'primary' : 'secondary'}
          onPress={() => answerWith(false)}
        />
      </View>
    </Card>
  )
}

/** Shown while there is no solution: anyone can propose one. */
function ProposeSolution({ reportId, onProposed }: { reportId: number; onProposed: () => void }) {
  const [solution, setSolution] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  /** Sends the proposal, one step per line. */
  async function submit() {
    const invalid = validateText(solution, LIMITS.solutionMax)
    if (invalid) {
      setError(invalid)
      return
    }
    setSending(true)
    try {
      await proposeSolution(reportId, solution)
      onProposed()
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <Card background="bgSubtle">
      <AppText variant="titleSmall">Pas encore de solution</AppText>
      <AppText color="textSecondary">
        Vous savez comment régler ce problème ? Expliquez-le, une étape par ligne.
      </AppText>
      <TextField
        label="Votre solution"
        multiline
        value={solution}
        onChangeText={setSolution}
        maxLength={LIMITS.solutionMax}
        error={error}
      />
      <Button
        icon="create-outline"
        label="Proposer une solution"
        loading={sending}
        onPress={submit}
      />
    </Card>
  )
}

/** Edit and delete buttons, for the author of the report. */
function OwnerActions({ report, user }: { report: ReportDetail; user: CurrentUser }) {
  if (report.user_id !== user.id && !user.isAdmin) return null

  /** Asks for confirmation, then deletes the report. */
  function confirmDelete() {
    Alert.alert('Supprimer ce signalement ?', 'Il ne pourra pas être récupéré.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () =>
          deleteReport(report.REP_id)
            .then(() => router.back())
            .catch((err: unknown) => Alert.alert(friendlyError(err))),
      },
    ])
  }

  return (
    <View style={styles.row}>
      <Button
        style={styles.flex}
        variant="secondary"
        icon="create-outline"
        label="Modifier"
        onPress={() =>
          router.push({ pathname: '/reports/[id]/edit', params: { id: String(report.REP_id) } })
        }
      />
      <Button
        style={styles.flex}
        variant="danger"
        icon="trash-outline"
        label="Supprimer"
        onPress={confirmDelete}
      />
    </View>
  )
}

/** Support actions: validate or refuse the solution, mark the report as a duplicate. */
function SupportActions({ report, onChanged }: { report: ReportDetail; onChanged: () => void }) {
  const [candidates, setCandidates] = useState<{ REP_id: number; REP_libelle: string }[] | null>(
    null,
  )

  /** Runs an admin action, then reloads the report. */
  function act(action: Promise<void>) {
    action.then(onChanged).catch((err: unknown) => Alert.alert(friendlyError(err)))
  }

  /** Lists similar reports the current one could duplicate. */
  async function findOriginals() {
    try {
      const found = await fetchSimilarReports(report.REP_libelle)
      setCandidates(found.filter((other) => other.REP_id !== report.REP_id))
    } catch (err) {
      Alert.alert(friendlyError(err))
    }
  }

  return (
    <Card background="bgBrandSoft">
      <View style={styles.row}>
        <Ionicons name="shield-checkmark-outline" size={22} />
        <AppText variant="titleSmall">Espace support</AppText>
      </View>
      {report.REP_solution && (
        <View style={styles.row}>
          <Button
            style={styles.flex}
            icon={
              report.REP_is_solution_validated ? 'close-circle-outline' : 'checkmark-circle-outline'
            }
            label={report.REP_is_solution_validated ? 'Retirer la validation' : 'Valider'}
            onPress={() =>
              act(setSolutionValidated(report.REP_id, !report.REP_is_solution_validated))
            }
          />
          <Button
            style={styles.flex}
            variant="danger"
            icon="close"
            label="Refuser"
            onPress={() => act(refuseSolution(report.REP_id))}
          />
        </View>
      )}
      {!report.REP_duplicate_of &&
        (candidates === null ? (
          <Button
            variant="secondary"
            icon="copy-outline"
            label="C’est un doublon…"
            onPress={findOriginals}
          />
        ) : candidates.length === 0 ? (
          <AppText color="textSecondary">Aucune fiche ressemblante trouvée.</AppText>
        ) : (
          candidates.map((other) => (
            <Button
              key={other.REP_id}
              variant="secondary"
              label={`Doublon de : ${other.REP_libelle}`}
              onPress={() => act(markDuplicate(report.REP_id, other.REP_id))}
            />
          ))
        ))}
    </Card>
  )
}

/** Colleagues' comments and a field to add one. */
function Comments({
  report,
  user,
  onAdded,
}: {
  report: ReportDetail
  user: CurrentUser | undefined
  onAdded: () => void
}) {
  const { colors } = useTheme()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  /** Sends the comment and reloads the list. */
  async function submit() {
    const invalid = validateText(text, LIMITS.commentMax)
    if (invalid) {
      setError(invalid)
      return
    }
    try {
      await addComment(report.REP_id, text)
      setText('')
      setError(null)
      onAdded()
    } catch (err) {
      setError(friendlyError(err))
    }
  }

  return (
    <View style={styles.block}>
      <AppText variant="titleSmall">Commentaires ({report.Comment.length})</AppText>
      {report.Comment.map((comment) => (
        <View key={comment.COM_id} style={[styles.comment, { backgroundColor: colors.bgSurface }]}>
          <AppText variant="caption" color="textSecondary">
            {comment.user_id === user?.id ? 'Vous' : 'Un collègue'} ·{' '}
            {relativeDate(comment.COM_created_at)}
          </AppText>
          <AppText>{comment.COM_content}</AppText>
        </View>
      ))}
      <TextField
        label="Ajouter un commentaire"
        multiline
        value={text}
        onChangeText={setText}
        maxLength={LIMITS.commentMax}
        error={error}
      />
      <Button variant="secondary" icon="chatbubble-outline" label="Publier" onPress={submit} />
    </View>
  )
}

const styles = StyleSheet.create({
  block: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  wrap: { flexWrap: 'wrap' },
  flex: { flex: 1 },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: { width: '100%', height: 220, borderRadius: radius.md },
  comment: { padding: spacing.md, borderRadius: radius.md, gap: spacing.xs },
})
