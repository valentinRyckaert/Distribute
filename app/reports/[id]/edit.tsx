import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import AppText from '@/src/components/AppText'
import Button from '@/src/components/Button'
import Chip from '@/src/components/Chip'
import Screen from '@/src/components/Screen'
import StateMessage from '@/src/components/StateMessage'
import TextField from '@/src/components/TextField'
import TopBar from '@/src/components/TopBar'
import { fetchCategories, fetchReport, updateReport } from '@/src/lib/api'
import { friendlyError } from '@/src/lib/errors'
import type { ReportDetail } from '@/src/lib/types'
import { useQuery } from '@/src/lib/useQuery'
import { LIMITS, validateText, validateTitle } from '@/src/lib/validation'
import { spacing } from '@/src/theme/tokens'

/** Edits the title, description, category and solution of a report (author or admin). */
export default function EditReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const report = useQuery(() => fetchReport(Number(id)), [id])
  if (!report.data) {
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
  return <EditForm report={report.data} />
}

/** The edit form, filled with the loaded report. */
function EditForm({ report }: { report: ReportDetail }) {
  const id = report.REP_id
  const categories = useQuery(fetchCategories)
  const [title, setTitle] = useState(report.REP_libelle)
  const [content, setContent] = useState(report.REP_content)
  const [solution, setSolution] = useState(report.REP_solution ?? '')
  const [baseId, setBaseId] = useState<number | null>(report.BAS_id)
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [saving, setSaving] = useState(false)

  /** Validates and saves; changing the solution drops its validation (database rule). */
  async function save() {
    const found = {
      title: validateTitle(title),
      content: validateText(content, LIMITS.contentMax),
      solution: validateText(solution, LIMITS.solutionMax, false),
    }
    setErrors(found)
    if (Object.values(found).some(Boolean)) return
    setSaving(true)
    try {
      await updateReport(id, {
        REP_libelle: title.trim(),
        REP_content: content,
        REP_solution: solution.trim() || null,
        BAS_id: baseId,
      })
      router.back()
    } catch (err) {
      setErrors({ save: friendlyError(err) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Screen
      footer={
        <>
          {errors.save && <AppText color="textDanger">{errors.save}</AppText>}
          <Button
            icon="checkmark-circle-outline"
            label="Enregistrer"
            loading={saving}
            onPress={save}
          />
        </>
      }
    >
      <TopBar />
      <AppText variant="titleLarge" accessibilityRole="header">
        Modifier le signalement
      </AppText>
      <TextField
        label="En une phrase"
        value={title}
        onChangeText={setTitle}
        maxLength={LIMITS.titleMax}
        error={errors.title}
      />
      <TextField
        label="Que se passe-t-il ?"
        multiline
        value={content}
        onChangeText={setContent}
        maxLength={LIMITS.contentMax}
        error={errors.content}
      />
      <AppText variant="labelMedium">Type de problème</AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Chip label="Je ne sais pas" selected={baseId === null} onPress={() => setBaseId(null)} />
        {categories.data?.map((category) => (
          <Chip
            key={category.BAS_id}
            label={category.BAS_libelle}
            selected={baseId === category.BAS_id}
            onPress={() => setBaseId(category.BAS_id)}
          />
        ))}
      </ScrollView>
      <TextField
        label="Solution (facultatif)"
        helper="Une étape par ligne. Si vous la modifiez, le support devra la valider à nouveau."
        multiline
        value={solution}
        onChangeText={setSolution}
        maxLength={LIMITS.solutionMax}
        error={errors.solution}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  chips: { gap: spacing.sm },
})
