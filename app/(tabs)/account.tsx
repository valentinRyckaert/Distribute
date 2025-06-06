import React, { useEffect, useState } from 'react';
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import ReportForm from '../components/ReportForm';
import { supabase } from '../lib/supabase';
import { Report } from '../lib/types';

export default function Account() {
  const [user, setUser] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [reports, setReports] = useState<Report[]>([]);
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null);
  const [reportToEdit, setReportToEdit] = useState<Report | null>(null);
  const [reportToDelete, setReportToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchReports(user.id);
      }
    };

    fetchUser();
  }, []);

  const fetchReports = async (userId: string) => {
    const { data, error } = await supabase
      .from('Report')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setReports(data);
    }
  };

  const handleDelete = async (reportId: number) => {
    const { error } = await supabase
      .from('Report')
      .delete()
      .eq('REP_id', reportId);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setReports(reports.filter(report => report.REP_id !== reportId));
      setReportToDelete(null);
      Alert.alert('Success', 'Report deleted successfully!');
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage(`Error: ${error.message}`);
    }
  };

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage('Error: passwords not corresponding');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: currentPassword,
    });

    if (error) {
      setErrorMessage('Error: current password incorrect');
      return;
    }

    const { data, error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setErrorMessage('Error: error during password update');
    } else {
      setUpdateMessage('Passsword updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Your Account</Text>
        {user ? (
          <View style={styles.userInfo}>
            <Text style={styles.label}>UID: {user.id}</Text>
            <Text style={styles.label}>Email: {user.email}</Text>
            <Text style={styles.label}>Created At: {new Date(user.created_at).toLocaleString()}</Text>
            <Text style={styles.label}>Last Sign In: {new Date(user.last_sign_in_at).toLocaleString()}</Text>
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
        {updateMessage ? <Text style={styles.updateMessage}>{updateMessage}</Text> : null}
        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

        <Text style={styles.subtitle}>Your Reports</Text>
        {reports.map((report) => (
          <View key={report.REP_id} style={styles.reportContainer}>
            <Text style={styles.reportTitle}>{report.REP_libelle}</Text>
            <View style={styles.buttonContainer}>
              <Button
                title={expandedReportId === report.REP_id ? "Cancel" : "Update"}
                onPress={() => {
                  if (expandedReportId === report.REP_id) {
                    setExpandedReportId(null);
                  } else {
                    setExpandedReportId(report.REP_id);
                    setReportToEdit(report);
                  }
                }}
                color={expandedReportId === report.REP_id ? "grey" : undefined}
              />
              <Button title="Delete" onPress={() => setReportToDelete(report.REP_id)} color="#FF5733" />
            </View>
            {reportToDelete === report.REP_id && (
              <View>
                <Text style={styles.deleteConfirmation}>Are you sure you want to delete this report?</Text>
                <Button title="Confirm Delete" onPress={() => handleDelete(report.REP_id)} color="#FF0000" />
              </View>
            )}
            {expandedReportId === report.REP_id && (
              <View style={styles.editForm}>
                <ReportForm currentReport={reportToEdit ? reportToEdit : null} />
              </View>
            )}
          </View>
        ))}
        <Button onPress={signOut} title="Sign Out" color="#FF5733" />
      </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  userInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  updateMessage: {
    marginTop: 10,
    color: 'green',
  },
  errorMessage: {
    marginTop: 10,
    color: 'red',
  },
  reportContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  editForm: {
    marginTop: 10,
  },
  picker: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  deleteConfirmation: {
    color: 'red',
    marginTop: 10,
    marginBottom: 10,
  },
});
