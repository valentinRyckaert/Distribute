import React, { useState } from 'react';
import { Text, View, TextInput, Button } from 'react-native';

export default function Login({onLogin}:any) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
  
    const handleLogin = () => {
      console.log('Email:', email)
      console.log('Password:', password)
      onLogin(email,password)
    }  

    return (
        <View className='flex-1 justify-center items-center bg-gray-100'>
            <Text className='text-2xl font-bold mb-6'>Login</Text>
            <TextInput className='border border-gray-300 rounded p-2 w-3/4 mb-4'
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput className='border border-gray-300 rounded p-2 w-3/4 mb-4'
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Login" onPress={handleLogin} />
        </View>
    )
}