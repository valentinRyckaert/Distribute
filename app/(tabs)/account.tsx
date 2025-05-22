import React, { useEffect, useState } from 'react';
import { Button, Text, View, StyleSheet, Alert, TextInput } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Account() {
  const [user, setUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } }: any = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage(`Error: ${error.message}`);
    }
  }

  async function updatePassword() {
    if (newPassword !== confirmPassword) {
      setErrorMessage('Error: Les mots de passe ne correspondent pas.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (error) {
      setErrorMessage('Error: Mot de passe actuel incorrect.');
      return;
    }

    const { data, error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      setErrorMessage('Error: Erreur lors de la mise à jour du mot de passe.');
    } else {
      setUpdateMessage('Mot de passe mis à jour avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Page</Text>
      {user ? (
        <View style={styles.userInfo}>
          <Text style={styles.label}>UID: {user.id}</Text>
          <Text style={styles.label}>Display Name: {user.user_metadata?.full_name || 'N/A'}</Text>
          <Text style={styles.label}>Email: {user.email}</Text>
          <Text style={styles.label}>Phone: {user.phone || 'N/A'}</Text>
          <Text style={styles.label}>Created At: {new Date(user.created_at).toLocaleString()}</Text>
          <Text style={styles.label}>Last Sign In: {new Date(user.last_sign_in_at).toLocaleString()}</Text>
        </View>
      ) : (
        <Text style={styles.label}>Loading user information...</Text>
      )}

      <TextInput
        placeholder="Mot de passe actuel"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Nouveau mot de passe"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Confirmer le nouveau mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button onPress={updatePassword} title="Mettre à jour le mot de passe" />
      {updateMessage ? <Text style={styles.updateMessage}>{updateMessage}</Text> : null}
      {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
      <Button onPress={signOut} title="Sign Out" color="#FF5733" />
    </View>
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
  userInfo: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
    marginBottom: 15,
    backgroundColor: '#ffffff',
  },
  updateMessage: {
    marginTop: 10,
    color: 'green',
  },
  errorMessage: {
    marginTop: 10,
    color: 'red',
  },
});

