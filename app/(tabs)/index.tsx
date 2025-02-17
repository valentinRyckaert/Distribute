import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../db/supabase';

export default function Index() {
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchLatestPosts();
    fetchCategories();
  }, []);

  const fetchLatestPosts = async () => {
    const { data, error } = await supabase
      .from('Report')
      .select('*')
      .order('REP_created_at', { ascending: false })
      .limit(5);

    if (error) console.error(error);
    else {
      setLatestPosts(data);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('Base')
      .select('*');
    if (error) console.error(error);
    else setCategories(data.map((cat: any) => cat));
  };

  const renderPost = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.postItem}>
      <Text style={styles.postTitle}>{item.REP_libelle}</Text>
      <Text style={styles.postDate}>{new Date(item.REP_created_at).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome to the Blog!</Text>

      <Text style={styles.sectionTitle}>Latest Posts</Text>
      <FlatList
        data={latestPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.REP_id}
        contentContainerStyle={styles.listContainer}
      />

      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categoriesContainer}>
        {categories.map((object: any) => (
          <Text key={object.BAS_id} style={styles.categoryItem}>
            {object.BAS_libelle}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  listContainer: {
    paddingBottom: 16,
  },
  postItem: {
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
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  postDate: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryItem: {
    backgroundColor: '#007BFF',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});
