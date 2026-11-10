import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { ScrollView, StyleSheet, View, type TextInputInstance } from 'react-native'
import AppText from '@/src/components/AppText'
import Button from '@/src/components/Button'
import Card from '@/src/components/Card'
import Chip from '@/src/components/Chip'
import ReportCard from '@/src/components/ReportCard'
import Screen from '@/src/components/Screen'
import StateMessage from '@/src/components/StateMessage'
import TextField from '@/src/components/TextField'
import { fetchCategories, searchReports } from '@/src/lib/api'
import { useQuery } from '@/src/lib/useQuery'
import { spacing } from '@/src/theme/tokens'

const SEARCH_DELAY_MS = 300

/** Search: typo-tolerant full-text search, filtered by category with chips. */
export default function SearchScreen() {
  const params = useLocalSearchParams<{ baseId?: string; focus?: string }>()
  const [text, setText] = useState('')
  const [query, setQuery] = useState('')
  const [baseId, setBaseId] = useState<number | null>(params.baseId ? Number(params.baseId) : null)
  const input = useRef<TextInputInstance>(null)
  const categories = useQuery(fetchCategories)
  const results = useQuery(() => searchReports(query, baseId), [query, baseId])

  // A category tapped on the home screen arrives as a route parameter (the tab stays mounted).
  const [routeBaseId, setRouteBaseId] = useState(params.baseId)
  if (params.baseId !== routeBaseId) {
    setRouteBaseId(params.baseId)
    if (params.baseId) setBaseId(Number(params.baseId))
  }

  useEffect(() => {
    if (params.focus) input.current?.focus()
  }, [params.focus])

  // Search after a pause in typing rather than at every key.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(text), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [text])

  const count = results.data?.length ?? 0

  return (
    <Screen bottomInset={false}>
      <AppText variant="titleLarge" accessibilityRole="header">
        Chercher une solution
      </AppText>
      <TextField
        ref={input}
        label="Votre problème en quelques mots"
        icon="search-outline"
        placeholder="Par exemple : wifi, imprimante"
        value={text}
        onChangeText={setText}
        returnKeyType="search"
        testID="search-input"
      >
        {!!text && (
          <Button variant="tertiary" icon="close" label="Effacer" onPress={() => setText('')} />
        )}
      </TextField>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Chip label="Tout" selected={baseId === null} onPress={() => setBaseId(null)} />
        {categories.data?.map((category) => (
          <Chip
            key={category.BAS_id}
            label={category.BAS_libelle}
            selected={baseId === category.BAS_id}
            onPress={() => setBaseId(category.BAS_id)}
          />
        ))}
      </ScrollView>

      {results.data && (
        <AppText variant="labelMedium" color="textSecondary" accessibilityLiveRegion="polite">
          {count === 0
            ? 'Aucune solution trouvée'
            : `${count} solution${count > 1 ? 's' : ''} trouvée${count > 1 ? 's' : ''}`}
        </AppText>
      )}
      <StateMessage
        loading={results.loading && !results.data}
        error={results.error}
        onRetry={results.reload}
      />
      {results.data?.map((report) => (
        <ReportCard key={report.REP_id} report={report} />
      ))}

      <Card background="bgSubtle">
        <AppText variant="titleSmall">Vous ne trouvez pas votre problème ?</AppText>
        <AppText color="textSecondary">
          Décrivez-le en quelques mots, un collègue ou le support vous répondra.
        </AppText>
        <View>
          <Button
            variant="secondary"
            icon="add-circle-outline"
            label="Signaler ce problème"
            onPress={() =>
              router.push({ pathname: '/report', params: text ? { title: text } : {} })
            }
          />
        </View>
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  chips: { gap: spacing.sm, paddingRight: spacing.xl },
})
