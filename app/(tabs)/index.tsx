import { Link } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import ReportCard from '@/src/components/ReportCard'
import { fetchBases, fetchLatestReports } from '@/src/lib/api'
import type { Base, ReportWithTags } from '@/src/lib/types'

/** Home screen: the latest reports and the list of categories. */
export default function HomeScreen() {
  const [latestReports, setLatestReports] = useState<ReportWithTags[]>([])
  const [bases, setBases] = useState<Base[]>([])

  useEffect(() => {
    fetchLatestReports()
      .then(setLatestReports)
      .catch((error: Error) => Alert.alert(error.message))
    fetchBases()
      .then(setBases)
      .catch((error: Error) => Alert.alert(error.message))
  }, [])

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Latest Posts</Text>
      {latestReports.map((report) => (
        <ReportCard key={report.REP_id} report={report} />
      ))}

      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categories}>
        {bases.map((base) => (
          <Link
            key={base.BAS_id}
            href={{ pathname: '/search', params: { baseId: base.BAS_id } }}
            style={styles.category}
          >
            {base.BAS_libelle}
          </Link>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 8, color: '#555' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  category: {
    backgroundColor: '#007BFF',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
})
