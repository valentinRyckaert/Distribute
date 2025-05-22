import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

export default function Search() {
  const [searchText, setSearchText] = useState('');
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [searchText, selectedCategory]);

  const fetchCategories = async () => {
    const { data, error }: any = await supabase.from('BaseCategory').select('*');
    if (error) console.error(error);
    else setCategories(data);
  };

  const fetchReports = async () => {
    let query = supabase.from('Report').select('*');

    if (searchText) {
      query = query.ilike('REP_libelle', `%${searchText}%`);
    }

    if (selectedCategory) {
      query = query.eq('BAS_id', selectedCategory);
    }

    const { data, error }: any = await query;
    if (error) console.error(error);
    else setReports(data);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Rechercher par nom"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      <View style={styles.categoryContainer}>
        {categories.map((category: any) => (
          <Button
            key={category.BC_id}
            title={category.BC_libelle}
            onPress={() => {
              setSelectedCategory(category.BAS_id);
            }}
            color="#007BFF"
          />
        ))}
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item: any) => item.REP_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.reportItem}>
            <Text style={styles.reportTitle}>{item.REP_libelle}</Text>
            <Text style={styles.reportContent}>{item.REP_content}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  reportItem: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reportContent: {
    fontSize: 14,
    color: '#6c757d',
  },
  listContainer: {
    paddingBottom: 20,
  },
});