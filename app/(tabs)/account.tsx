import React from 'react';
import { Button, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';


export default function Account() {

  async function signOut() {
    const { error } = await supabase.auth.signOut()
  }

  return (
    <View>
      <Text>Account page</Text>
      <Button onPress={signOut} title="Sign Out" />
    </View>
  )
};