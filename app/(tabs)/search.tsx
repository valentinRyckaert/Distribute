import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, Picker } from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Report, Category, Asset, AssetType, Tag } from '../lib/types';
import RenderReport from '../components/RenderReport';

interface SelectedOption {
  id: number;
  libelle: string;
  type: string;
}

export default function Search() {
  const [searchText, setSearchText] = useState<string>('');
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedAsset, setSelectedAsset] = useState<number | ''>('');
  const [selectedAssetType, setSelectedAssetType] = useState<number | ''>('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [tagIdForPicker, setTagIdForPicker] = useState<Tag | ''>('');
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchAssets();
    fetchAssetTypes();
    fetchTags();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [selectedCategory, selectedAsset, selectedAssetType, selectedTags]);

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('Base').select('*');
    if (error) console.error(error);
    else setCategories(data);
  };

  const fetchAssets = async () => {
    const { data, error } = await supabase.from('Asset').select('*');
    if (error) console.error(error);
    else setAssets(data);
  };

  const fetchAssetTypes = async () => {
    const { data, error } = await supabase.from('AssetType').select('*');
    if (error) console.error(error);
    else setAssetTypes(data);
  };

  const fetchTags = async () => {
    const { data, error } = await supabase.from('Tag').select('*');
    if (error) console.error(error);
    else setTags(data);
  };

  const fetchReports = async () => {
    let query = supabase.from('Report').select('*');

    if (searchText) {
      query = query.ilike('REP_libelle', `%${searchText}%`);
    }

    if (selectedCategory) {
      query = query.eq('BAS_id', selectedCategory);
    }

    if (selectedAsset) {
      query = query.eq('AS_id', selectedAsset);
    }

    if (selectedAssetType) {
      query = query.eq('AT_id', selectedAssetType);
    }

    if (selectedTags.length > 0) {
      const { data: reportHasTags, error } = await supabase
        .from('ReportHasTag')
        .select('REP_id')
        .in('TAG_id', selectedTags);

      if (error) console.error(error);
      else {
        const reportIds = reportHasTags.map(rht => rht.REP_id);
        query = query.in('REP_id', reportIds);
      }
    }

    const { data, error } = await query;
    if (error) console.error(error);
    else setReports(data);
  };

  const handleSelectOption = (type: string, id: number, libelle: string) => {
    switch (type) {
      case 'category':
        setSelectedCategory(id);
        break;
      case 'asset':
        setSelectedAsset(id);
        break;
      case 'assetType':
        setSelectedAssetType(id);
        break;
      case 'tag':
        setSelectedTags(prev => [...prev, id]);
        break;
    }
    setSelectedOptions(prev => [...prev, { id, libelle, type }]);
  };

  const handleRemoveOption = (type: string, id: number) => {
    switch (type) {
      case 'category':
        setSelectedCategory('');
        break;
      case 'asset':
        setSelectedAsset('');
        break;
      case 'assetType':
        setSelectedAssetType('');
        break;
      case 'tag':
        setSelectedTags(prev => prev.filter(tagId => tagId !== id));
        setTagIdForPicker('')
        break;
    }
    setSelectedOptions(prev => prev.filter(option => !(option.id === id && option.type === type)));
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Rechercher par nom"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCategory}
          style={styles.picker}
          onValueChange={(itemLibelle: string, itemIndex: number) => handleSelectOption('category', itemIndex, itemLibelle)}>
          <Picker.Item label="Select a Category" value={null} />
          {categories.map((category) => (
            <Picker.Item key={category.BAS_id} label={category.BAS_libelle} value={category.BAS_libelle} />
          ))}
        </Picker>

        <Picker
          selectedValue={selectedAsset}
          style={styles.picker}
          onValueChange={(itemLibelle: string, itemIndex: number) => handleSelectOption('asset', itemIndex, itemLibelle)}>
          <Picker.Item label="Select an Asset" value={null} />
          {assets.map((asset) => (
            <Picker.Item key={asset.AS_id} label={asset.AS_name} value={asset.AS_name} />
          ))}
        </Picker>

        <Picker
          selectedValue={selectedAssetType}
          style={styles.picker}
          onValueChange={(itemLibelle: string, itemIndex: number) => handleSelectOption('assetType', itemIndex, itemLibelle)}>
          <Picker.Item label="Select an Asset Type" value={null} />
          {assetTypes.map((assetType) => (
            <Picker.Item key={assetType.AT_id} label={assetType.AT_libelle} value={assetType.AT_libelle} />
          ))}
        </Picker>

        <Picker
          selectedValue={tagIdForPicker}
          style={styles.picker}
          onValueChange={(itemLibelle: string, itemIndex: number) => handleSelectOption('tag', itemIndex, itemLibelle)}>
          <Picker.Item label="Select a Tag" value={null} />
          {tags.map((tag) => (
            <Picker.Item key={tag.TAG_id} label={tag.TAG_libelle} value={tag.TAG_libelle} />
          ))}
        </Picker>
      </View>

      <View style={styles.selectedOptionsContainer}>
        {selectedOptions.map((option, index) => (
          <View key={index} style={styles.selectedOption}>
            <Ionicons name="close" size={20} color="black" onPress={() => handleRemoveOption(option.type, option.id)} />
            <Text>{option.libelle}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.REP_id.toString()}
        renderItem={({ item }) => <RenderReport item={item}/>}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

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
  pickerContainer: {
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
  },
  selectedOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  selectedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  reportItem: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
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