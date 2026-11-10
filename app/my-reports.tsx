import React from 'react'
import AppText from '@/src/components/AppText'
import ReportCard from '@/src/components/ReportCard'
import Screen from '@/src/components/Screen'
import StateMessage from '@/src/components/StateMessage'
import TopBar from '@/src/components/TopBar'
import { fetchMyReports } from '@/src/lib/api'
import { useQuery } from '@/src/lib/useQuery'

/** All the reports written by the user. */
export default function MyReportsScreen() {
  const reports = useQuery(fetchMyReports)
  return (
    <Screen>
      <TopBar />
      <AppText variant="titleLarge" accessibilityRole="header">
        Mes signalements
      </AppText>
      <StateMessage
        loading={reports.loading && !reports.data}
        error={reports.error}
        onRetry={reports.reload}
        empty={reports.data?.length === 0 ? 'Vous n’avez encore rien signalé.' : undefined}
      />
      {reports.data?.map((report) => (
        <ReportCard key={report.REP_id} report={report} showDate />
      ))}
    </Screen>
  )
}
