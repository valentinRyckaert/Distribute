import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { supabase } from '@/app/lib/supabase'
import { useLocalSearchParams } from 'expo-router'

export default function Index() {
  const [post, setPost]: any = useState<any[]>([])
  const local = useLocalSearchParams()

  useEffect(() => {
    fetchPost()
  }, [])

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('Report')
      .select('*')
      .eq('REP_id', local.id)
    if (error) console.error(error)
    else {
      setPost(data[0])
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{post.REP_libelle}</Text>
      <Text style={styles.content}>{post.REP_content}</Text>
      <Text style={styles.date}>Created at: {new Date(post.REP_created_at).toLocaleString()}</Text>
      <Text style={styles.solution}>Solution: {post.REP_solution}</Text>
      <Text style={styles.validation}>Is Solution Validated: {post.REP_is_solution_validated ? 'Yes' : 'No'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  content: {
    fontSize: 16,
    marginBottom: 16,
    color: '#555',
  },
  date: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },
  solution: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  validation: {
    fontSize: 16,
    color: '#555',
  },
})
