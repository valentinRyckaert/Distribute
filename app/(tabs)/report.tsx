import { ScrollView, StyleSheet, Text } from 'react-native'
import ReportForm from '@/src/components/ReportForm'

/** Screen to create a new report. */
export default function CreateScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Create a New Report</Text>
      <ReportForm currentReport={null} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#333' },
})
