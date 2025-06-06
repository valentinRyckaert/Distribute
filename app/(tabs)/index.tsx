import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import RenderReport from '../components/RenderReport';
import { supabase } from '../lib/supabase';
import { Category, Report } from '../lib/types';

export default function Index() {
  const [latestPosts, setLatestPosts] = useState<Report[]>([])
  const [baseList, setBaseList] = useState<Category[]>([])

  useEffect(() => {
    fetchLatestPosts()
    fetchCategories()
  }, [])

  const fetchLatestPosts = async () => {
    const { data, error } = await supabase
      .from('Report')
      .select('*')
      .order('REP_created_at', { ascending: false })
      .limit(5)
    if (error) Alert.alert(error.message)
    else {
      setLatestPosts(data)
    }
  }

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('Base')
      .select('*')
    if (error) Alert.alert(error.message)
    else setBaseList(data)
  }

  return (
    
      <ScrollView style={styles.container}>

        <Text style={styles.sectionTitle}>Latest Posts</Text>
        
        {latestPosts.map((item: Report)=> <RenderReport item={item}/>)}

        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoriesContainer}>
          {baseList.map((object: Category) => (
            <Text key={object.BAS_id} style={styles.categoryItem}>
              {object.BAS_libelle}
            </Text>
          ))}
        </View>
      </ScrollView>
    
  )
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
})
