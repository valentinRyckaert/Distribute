import { Link } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { ReportWithTags } from '@/src/lib/types'

interface ReportCardProps {
  report: ReportWithTags
}

/** A tappable summary of a report (title, date, tags) that opens its detail screen. */
export default function ReportCard({ report }: ReportCardProps) {
  return (
    <Link href={{ pathname: '/reports/[id]', params: { id: report.REP_id } }} asChild>
      <Pressable style={styles.card}>
        <Text style={styles.title}>{report.REP_libelle}</Text>
        <Text style={styles.date}>{new Date(report.REP_created_at).toLocaleDateString()}</Text>
        <View style={styles.tags}>
          {report.Tag.map((tag) => (
            <View key={tag.TAG_id} style={styles.tag}>
              <Text style={styles.tagText}>#{tag.TAG_libelle}</Text>
            </View>
          ))}
        </View>
      </Pressable>
    </Link>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  date: { fontSize: 14, color: '#777', marginTop: 4 },
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
})
