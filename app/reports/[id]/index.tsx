import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '@/app/lib/supabase';
import { useLocalSearchParams } from 'expo-router';

export default function Index() {
  const [post, setPost]: any = useState(null);
  const local = useLocalSearchParams();

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    const { data, error } = await supabase
      .from('Report')
      .select('*')
      .eq('REP_id', local.id);
    if (error) {
      console.error(error);
    } else {
      setPost(data[0])
      localStorage.setItem("currentReport", JSON.stringify(data[0]))
    }
  };

  if (!post) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{post.REP_libelle}</Text>
        <Text style={styles.content}>{post.REP_content}</Text>
        <Text style={styles.date}>Created at: {new Date(post.REP_created_at).toLocaleString()}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f0f2f5',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    marginBottom: 16,
    color: '#555',
    lineHeight: 24,
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
    fontStyle: 'italic',
  }
});
