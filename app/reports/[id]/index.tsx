import { useLocalSearchParams } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, Button, ScrollView, StyleSheet, Text, View } from 'react-native'
import { fetchReport, isCurrentUserAdmin, setSolutionValidated } from '@/src/lib/api'
import type { ReportDetail } from '@/src/lib/types'

/** Report detail screen: problem, solution, validation status, and the validation toggle for admins. */
export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [report, setReport] = useState<ReportDetail | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReport(Number(id))
      .then(setReport)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
    isCurrentUserAdmin().then(setIsAdmin)
  }, [id])

  /** Flips the validation flag of the solution (admin only). */
  async function handleToggleValidation() {
    if (!report) return
    try {
      await setSolutionValidated(report.REP_id, !report.REP_is_solution_validated)
    } catch {
      setError('Failed to update validation status.')
      return
    }
    setReport({ ...report, REP_is_solution_validated: !report.REP_is_solution_validated })
    Alert.alert('Validation status updated successfully!')
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    )
  }
  if (!report) {
    return (
      <View style={styles.container}>
        <Text>{loading ? 'Loading...' : 'This report does not exist.'}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{report.REP_libelle}</Text>
        <Text style={styles.content}>{report.REP_content}</Text>
        <Text style={styles.date}>
          Created at: {new Date(report.REP_created_at).toLocaleString()}
        </Text>
        {report.Base && <Text style={styles.meta}>Base: {report.Base.BAS_libelle}</Text>}
        {report.Asset && <Text style={styles.meta}>Asset: {report.Asset.AS_name}</Text>}
        {report.AssetType && (
          <Text style={styles.meta}>Asset Type: {report.AssetType.AT_libelle}</Text>
        )}
        <View style={styles.tags}>
          {report.Tag.map((tag) => (
            <View key={tag.TAG_id} style={styles.tag}>
              <Text style={styles.tagText}>#{tag.TAG_libelle}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.title}>Report Solution</Text>
      <View style={styles.card}>
        <Text style={styles.content}>
          {report.REP_solution ||
            'This report has currently no solution. If you want to propose one, please contact the creator of this report.'}
        </Text>
        <Text style={styles.date}>
          {report.REP_is_solution_validated
            ? 'This solution has been validated.'
            : 'This solution has not been validated yet.'}
        </Text>
      </View>

      {isAdmin && (
        <View style={styles.card}>
          <Text style={styles.subtitle}>Validate Solution</Text>
          <Text>{report.REP_is_solution_validated ? 'Validated' : 'Not Validated'}</Text>
          <Button title="Change value" onPress={handleToggleValidation} />
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f2f5' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#333', textAlign: 'center' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  content: { fontSize: 16, marginBottom: 16, color: '#555', lineHeight: 24 },
  date: { fontSize: 14, color: '#888', marginBottom: 16, fontStyle: 'italic' },
  meta: { fontSize: 16, color: '#555', marginBottom: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  tag: {
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: { color: '#007BFF', fontSize: 14 },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
})
