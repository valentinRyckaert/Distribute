import type { User } from '@supabase/supabase-js'
import React, { useEffect, useState } from 'react'
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import ReportForm from '@/src/components/ReportForm'
import { deleteReport, fetchUserReports } from '@/src/lib/api'
import { supabase } from '@/src/lib/supabase'
import type { ReportWithTags } from '@/src/lib/types'

/** Account screen: user info, password change, the user's own reports (edit, delete) and sign-out. */
export default function AccountScreen() {
  const [user, setUser] = useState<User | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updateMessage, setUpdateMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [reports, setReports] = useState<ReportWithTags[]>([])
  const [editedReportId, setEditedReportId] = useState<number | null>(null)
  const [reportToDelete, setReportToDelete] = useState<number | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) loadReports(data.user.id)
    })
  }, [])

  /** Loads the reports written by the user. */
  function loadReports(userId: string) {
    fetchUserReports(userId)
      .then(setReports)
      .catch((error: Error) => Alert.alert('Error', error.message))
  }

  /** Closes the edit form and reloads the list so the change shows. */
  function handleSaved() {
    setEditedReportId(null)
    if (user) loadReports(user.id)
  }

  /** Deletes a report after the user confirmed it. */
  async function handleDelete(reportId: number) {
    try {
      await deleteReport(reportId)
    } catch (error) {
      Alert.alert('Error', (error as Error).message)
      return
    }
    setReports((prev) => prev.filter((report) => report.REP_id !== reportId))
    setReportToDelete(null)
    Alert.alert('Success', 'Report deleted successfully!')
  }

  /** Signs out; the root layout then shows the sign-in form. */
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) setErrorMessage(`Error: ${error.message}`)
  }

  /** Checks the current password by signing in again, then sets the new one. */
  async function updatePassword() {
    if (newPassword !== confirmPassword) {
      setErrorMessage('Error: passwords not corresponding')
      return
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: user?.email ?? '',
      password: currentPassword,
    })
    if (error) {
      setErrorMessage('Error: current password incorrect')
      return
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) {
      setErrorMessage('Error: error during password update')
      return
    }
    setUpdateMessage('Passsword updated!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Account</Text>
      {user ? (
        <View style={styles.card}>
          <Text style={styles.label}>UID: {user.id}</Text>
          <Text style={styles.label}>Email: {user.email}</Text>
          <Text style={styles.label}>Created At: {new Date(user.created_at).toLocaleString()}</Text>
          <Text style={styles.label}>
            Last Sign In: {new Date(user.last_sign_in_at ?? '').toLocaleString()}
          </Text>
        </View>
      ) : (
        <Text style={styles.label}>Loading user information...</Text>
      )}

      <TextInput
        placeholder="Current password"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="New password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Password confirmation"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button onPress={updatePassword} title="Update Password" />
      {updateMessage ? <Text style={styles.success}>{updateMessage}</Text> : null}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Text style={styles.subtitle}>Your Reports</Text>
      {reports.map((report) => (
        <View key={report.REP_id} style={styles.card}>
          <Text style={styles.reportTitle}>{report.REP_libelle}</Text>
          <View style={styles.buttons}>
            <Button
              title={editedReportId === report.REP_id ? 'Cancel' : 'Update'}
              onPress={() =>
                setEditedReportId(editedReportId === report.REP_id ? null : report.REP_id)
              }
              color={editedReportId === report.REP_id ? 'grey' : undefined}
            />
            <Button
              title="Delete"
              onPress={() => setReportToDelete(report.REP_id)}
              color="#FF5733"
            />
          </View>
          {reportToDelete === report.REP_id && (
            <View>
              <Text style={styles.error}>Are you sure you want to delete this report?</Text>
              <Button
                title="Confirm Delete"
                onPress={() => handleDelete(report.REP_id)}
                color="#FF0000"
              />
            </View>
          )}
          {editedReportId === report.REP_id && (
            <ReportForm currentReport={report} onSaved={handleSaved} />
          )}
        </View>
      ))}
      <Button onPress={signOut} title="Sign Out" color="#FF5733" />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  card: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    elevation: 2,
  },
  label: { fontSize: 16, marginVertical: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  success: { marginTop: 10, color: 'green' },
  error: { marginTop: 10, marginBottom: 10, color: 'red' },
  reportTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
})
