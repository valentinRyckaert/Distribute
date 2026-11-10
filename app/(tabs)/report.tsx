import Ionicons from '@expo/vector-icons/Ionicons'
import * as ImagePicker from 'expo-image-picker'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useRef, useState } from 'react'
import { Image, Pressable, StyleSheet, View, type TextInputInstance } from 'react-native'
import AppText from '@/src/components/AppText'
import Button from '@/src/components/Button'
import Card from '@/src/components/Card'
import CategoryTile from '@/src/components/CategoryTile'
import Chip from '@/src/components/Chip'
import IconBubble, { type IconName } from '@/src/components/IconBubble'
import Screen from '@/src/components/Screen'
import StateMessage from '@/src/components/StateMessage'
import StepIndicator from '@/src/components/StepIndicator'
import TextField from '@/src/components/TextField'
import TopBar from '@/src/components/TopBar'
import { createReport, fetchCategories, fetchSimilarReports } from '@/src/lib/api'
import { friendlyError } from '@/src/lib/errors'
import type { CategoryWithCount, ReportCardData, Since } from '@/src/lib/types'
import { useQuery } from '@/src/lib/useQuery'
import { LIMITS, validateText, validateTitle } from '@/src/lib/validation'
import { useTheme } from '@/src/theme/settings'
import { radius, spacing } from '@/src/theme/tokens'

const SINCE_LABELS: Record<Since, string> = {
  today: 'Aujourd’hui',
  week: 'Cette semaine',
  longer: 'Plus longtemps',
}

const STEP_TEXTS = [
  'Étape 1 sur 3. Quel est le type de problème ? Touchez la carte qui correspond le mieux.',
  'Étape 2 sur 3. Décrivez le problème. Pas besoin de mots techniques.',
  'Étape 3 sur 3. Vérifiez avant d’envoyer.',
]

/** Guided report in three steps: choose the type, describe the problem, check and send. */
export default function ReportScreen() {
  const params = useLocalSearchParams<{ title?: string }>()
  const [step, setStep] = useState(1)
  const [baseId, setBaseId] = useState<number | null | undefined>(undefined)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [since, setSince] = useState<Since | null>(null)
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [notify, setNotify] = useState(true)
  const [errors, setErrors] = useState<{ title?: string | null; content?: string | null }>({})
  const [similar, setSimilar] = useState<ReportCardData[]>([])
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [dictationHint, setDictationHint] = useState(false)
  const contentInput = useRef<TextInputInstance>(null)
  const categories = useQuery(fetchCategories)

  // "Signaler ce problème" from the search screen pre-fills the title (the tab stays mounted).
  const [prefill, setPrefill] = useState<string | undefined>()
  if (params.title !== prefill) {
    setPrefill(params.title)
    if (params.title) setTitle(params.title)
  }

  const category = categories.data?.find((item) => item.BAS_id === baseId)

  /** Goes to the next step once the current one is valid. */
  function next() {
    if (step === 2) {
      const found = {
        title: validateTitle(title),
        content: validateText(content, LIMITS.contentMax, false),
      }
      setErrors(found)
      if (found.title || found.content) return
      fetchSimilarReports(title)
        .then(setSimilar)
        .catch(() => setSimilar([]))
    }
    setStep(step + 1)
  }

  /** Lets the user pick a screenshot or photo; location data is not kept. */
  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
      exif: false,
    })
    if (!result.canceled) setPhotoUri(result.assets[0].uri)
  }

  /** Sends the report, then shows the confirmation screen and resets the form. */
  async function send() {
    setSending(true)
    setSendError(null)
    try {
      const id = await createReport({
        REP_libelle: title.trim(),
        // The description is optional in the form but required in the database: reuse the title.
        REP_content: content.trim() || title.trim(),
        BAS_id: baseId ?? null,
        REP_since: since,
        REP_notify: notify,
        photoUri,
      })
      router.push({ pathname: '/report-sent', params: { id: String(id) } })
      setStep(1)
      setBaseId(undefined)
      setTitle('')
      setContent('')
      setSince(null)
      setPhotoUri(null)
      setNotify(true)
    } catch (err) {
      setSendError(friendlyError(err))
    } finally {
      setSending(false)
    }
  }

  const footer =
    step < 3 ? (
      <Button
        icon="arrow-forward"
        label="Continuer"
        disabled={step === 1 && baseId === undefined}
        onPress={next}
        accessibilityHint={
          step === 1 && baseId === undefined ? 'Choisissez d’abord un type' : undefined
        }
      />
    ) : (
      <>
        {sendError && (
          <AppText color="textDanger" accessibilityLiveRegion="polite">
            {sendError}
          </AppText>
        )}
        <Button
          icon="checkmark-circle-outline"
          label="Envoyer mon signalement"
          loading={sending}
          onPress={send}
        />
      </>
    )

  return (
    <Screen footer={footer} bottomInset={false}>
      <TopBar
        listenText={STEP_TEXTS[step - 1]}
        onBack={() => (step > 1 ? setStep(step - 1) : router.back())}
      />
      <StepIndicator current={step} total={3} />

      {step === 1 && (
        <StepType
          categories={categories.data}
          loading={categories.loading}
          error={categories.error}
          onRetry={categories.reload}
          selected={baseId}
          onSelect={setBaseId}
        />
      )}

      {step === 2 && (
        <>
          <Heading
            title="Décrivez le problème"
            text="Pas besoin de mots techniques : dites-le comme à un collègue."
          />
          <TextField
            label="En une phrase"
            helper="Ce sera le titre de votre signalement."
            icon="create-outline"
            value={title}
            onChangeText={setTitle}
            maxLength={LIMITS.titleMax}
            error={errors.title}
            testID="report-title"
          />
          <TextField
            ref={contentInput}
            label="Que se passe-t-il ? (facultatif)"
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={LIMITS.contentMax}
            error={errors.content}
            helper={dictationHint ? 'Touchez le micro de votre clavier, puis parlez.' : undefined}
            testID="report-content"
          >
            <View>
              <Chip
                label="Dicter au lieu d’écrire"
                onPress={() => {
                  // shortcut: relies on the keyboard's dictation, a speech-to-text module needs a dev build.
                  setDictationHint(true)
                  contentInput.current?.focus()
                }}
              />
            </View>
          </TextField>
          {photoUri ? (
            <Card style={styles.photoRow}>
              <Image
                source={{ uri: photoUri }}
                style={styles.photo}
                accessibilityIgnoresInvertColors
              />
              <AppText style={styles.flex}>Photo ajoutée</AppText>
              <Button
                variant="danger"
                icon="trash-outline"
                label="Retirer"
                onPress={() => setPhotoUri(null)}
              />
            </Card>
          ) : (
            <Button
              variant="secondary"
              icon="camera-outline"
              label="Ajouter une photo de l’écran"
              onPress={pickPhoto}
            />
          )}
          <AppText variant="titleSmall">Depuis quand ?</AppText>
          <View style={styles.wrap}>
            {(Object.keys(SINCE_LABELS) as Since[]).map((value) => (
              <Chip
                key={value}
                label={SINCE_LABELS[value]}
                selected={since === value}
                onPress={() => setSince(since === value ? null : value)}
              />
            ))}
          </View>
        </>
      )}

      {step === 3 && (
        <>
          <Heading title="Vérifiez avant d’envoyer" />
          <Card>
            <View style={styles.summaryHeader}>
              <AppText variant="titleSmall">Votre signalement</AppText>
              <Button
                variant="tertiary"
                icon="create-outline"
                label="Modifier"
                onPress={() => setStep(2)}
              />
            </View>
            <Summary label="Type" value={category?.BAS_libelle ?? 'Je ne sais pas'} />
            <Summary label="En une phrase" value={title} />
            {!!content && <Summary label="Détails" value={content} />}
            {since && <Summary label="Depuis" value={SINCE_LABELS[since]} />}
            <Summary label="Photo" value={photoUri ? '1 photo ajoutée' : 'Aucune'} />
          </Card>
          {similar.length > 0 && <SimilarReports reports={similar} />}
          <NotifyToggle value={notify} onChange={setNotify} />
        </>
      )}
    </Screen>
  )
}

/** Title and optional explanation of a step. */
function Heading({ title, text }: { title: string; text?: string }) {
  return (
    <View style={styles.heading}>
      <AppText variant="titleLarge" accessibilityRole="header">
        {title}
      </AppText>
      {text && (
        <AppText variant="bodyLarge" color="textSecondary">
          {text}
        </AppText>
      )}
    </View>
  )
}

interface StepTypeProps {
  categories: CategoryWithCount[] | undefined
  loading: boolean
  error: string | null
  onRetry: () => void
  selected: number | null | undefined
  onSelect: (baseId: number | null) => void
}

/** Step 1: one big card per category, plus "I don't know". */
function StepType({ categories, loading, error, onRetry, selected, onSelect }: StepTypeProps) {
  const { colors } = useTheme()
  return (
    <>
      <Heading
        title="Quel est le type de problème ?"
        text="Touchez la carte qui correspond le mieux."
      />
      <StateMessage loading={loading && !categories} error={error} onRetry={onRetry} />
      <View style={styles.grid}>
        {categories?.map((item) => (
          <CategoryTile
            key={item.BAS_id}
            label={item.BAS_libelle}
            icon={item.BAS_icon as IconName}
            detail={item.BAS_description}
            selected={selected === item.BAS_id}
            onPress={() => onSelect(item.BAS_id)}
          />
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: selected === null }}
        onPress={() => onSelect(null)}
        style={[
          styles.unknown,
          {
            backgroundColor: selected === null ? colors.bgBrandSoft : colors.bgSurface,
            borderColor: selected === null ? colors.borderFocus : colors.borderDefault,
            borderWidth: selected === null ? 2.5 : 1,
          },
        ]}
      >
        <IconBubble name="help-circle-outline" />
        <AppText variant="bodyLarge" style={styles.flex}>
          Je ne sais pas / autre chose
        </AppText>
        <Ionicons name="chevron-forward" size={22} color={colors.iconSecondary} />
      </Pressable>
    </>
  )
}

/** One line of the step 3 summary. */
function Summary({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
      <AppText variant="bodyLarge">{value}</AppText>
    </View>
  )
}

/** Existing solutions that look like the new problem, shown before sending. */
function SimilarReports({ reports }: { reports: ReportCardData[] }) {
  const { colors } = useTheme()
  return (
    <Card background="bgBrandSoft">
      <View style={styles.summaryHeader}>
        <IconBubble name="bulb-outline" background="bgSurface" />
        <AppText variant="labelLarge" style={styles.flex}>
          Ces solutions ressemblent à votre problème
        </AppText>
      </View>
      {reports.map((report) => (
        <Pressable
          key={report.REP_id}
          accessibilityRole="button"
          onPress={() =>
            router.push({ pathname: '/reports/[id]', params: { id: String(report.REP_id) } })
          }
          style={[styles.similar, { backgroundColor: colors.bgSurface }]}
        >
          <IconBubble
            name={(report.Base?.BAS_icon ?? 'help-circle-outline') as IconName}
            size={36}
          />
          <AppText style={styles.flex}>{report.REP_libelle}</AppText>
          <Ionicons name="chevron-forward" size={22} color={colors.iconSecondary} />
        </Pressable>
      ))}
    </Card>
  )
}

/** "Me prévenir quand une solution est proposée" checkbox. */
function NotifyToggle({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  const { colors } = useTheme()
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[
        styles.notify,
        {
          borderColor: value ? colors.borderFocus : colors.borderStrong,
          backgroundColor: colors.bgSurface,
        },
      ]}
    >
      <Ionicons
        name={value ? 'checkmark-circle-outline' : 'ellipse-outline'}
        size={28}
        color={value ? colors.iconBrand : colors.iconSecondary}
      />
      <AppText variant="bodyLarge" style={styles.flex}>
        Me prévenir quand une solution est proposée
      </AppText>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  heading: { gap: spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  flex: { flex: 1 },
  unknown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  photoRow: { flexDirection: 'row', alignItems: 'center' },
  photo: { width: 56, height: 56, borderRadius: radius.sm },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  similar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  notify: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
  },
})
