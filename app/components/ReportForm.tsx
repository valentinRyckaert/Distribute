import React, { useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, Picker, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Report, Base, Asset, AssetType, Tag } from '../lib/types';


interface ReportFormProps {
  currentReport: Report | null;
}

export default function ReportForm({ currentReport }: ReportFormProps) {

  const [title, setTitle] = useState(currentReport ? currentReport.REP_libelle : '');
  const [content, setContent] = useState(currentReport ? currentReport.REP_content : '');
  const [solution, setSolution] = useState(currentReport ? currentReport.REP_solution : '');
  const [asId, setAsId] = useState<number | ''>(currentReport ? currentReport.AS_id || '' : '');
  const [basId, setBasId] = useState<number | ''>(currentReport ? currentReport.BAS_id || '' : '');
  const [assetTypeId, setAssetTypeId] = useState<number | ''>(currentReport ? currentReport.AT_id || '' : '');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [tagIdForPicker, setTagIdForPicker] = useState<Tag | ''>('');
  const [newAsset, setNewAsset] = useState('');
  const [newBase, setNewBase] = useState('');
  const [newAssetType, setNewAssetType] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      const { data, error } = await supabase.from('Asset').select('AS_id, AS_name');
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setAssets(data);
      }
    };

    const fetchBases = async () => {
      const { data, error } = await supabase.from('Base').select('BAS_id, BAS_libelle');
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setBases(data);
      }
    };

    const fetchAssetTypes = async () => {
      const { data, error } = await supabase.from('AssetType').select('*');
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setAssetTypes(data);
      }
    };

    const fetchTags = async () => {
      const { data, error } = await supabase.from('Tag').select('*');
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setTags(data);
      }
    };

    fetchAssets();
    fetchBases();
    fetchAssetTypes();
    fetchTags();
  }, []);

  const handleSubmit = async () => {
    if (!title || !content) {
      Alert.alert('Error', 'Both title and content are required.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    const lastReport: Report | any = currentReport ? [currentReport] : (await supabase
      .from('Report')
      .select('*')
      .order('REP_created_at', { ascending: false })
      .limit(1)).data ?? [];

    const reportID: number = currentReport ? currentReport.REP_id : lastReport[0]?.REP_id + 1 || 1;

    const { error } = currentReport
      ? await supabase
          .from('Report')
          .update({
            REP_libelle: title,
            REP_content: content,
            REP_created_at: new Date().toISOString(),
            AS_id: asId ? asId : null,
            BAS_id: basId ? basId : null,
            REP_solution: solution,
            REP_is_solution_validated: false,
            AT_id: assetTypeId ? assetTypeId : null,
            user_id: userId,
          })
          .eq('REP_id', reportID)
      : await supabase
          .from('Report')
          .insert({
            REP_id: reportID,
            REP_libelle: title,
            REP_content: content,
            REP_created_at: new Date().toISOString(),
            AS_id: asId ? asId : null,
            BAS_id: basId ? basId : null,
            REP_solution: solution,
            REP_is_solution_validated: false,
            AT_id: assetTypeId ? assetTypeId : null,
            user_id: userId,
          });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Report created successfully!');
      setTitle('');
      setContent('');
      setSolution('');
      setAsId('');
      setTagIdForPicker('');
      setBasId('');
      setAssetTypeId('');
      setSelectedTags([]);
    }
  };

  const handleAddTag = (tagId: string) => {
    setSelectedTags(prev => [...prev, parseInt(tagId)]);
    setTagIdForPicker('');
  };

  const handleRemoveTag = (tagId: number) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Content"
        value={content}
        onChangeText={setContent}
        multiline
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Solution"
        value={solution}
        onChangeText={setSolution}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="New Asset"
        value={newAsset}
        onChangeText={setNewAsset}
        editable={!asId}
      />
      <Picker
        selectedValue={asId}
        style={styles.picker}
        onValueChange={(itemValue: number) => {
          setAsId(itemValue);
          setNewAsset('');
        }}
        enabled={!newAsset}>
        <Picker.Item label="Select Asset" value="" />
        {assets.map((asset) => (
          <Picker.Item key={asset.AS_id} label={asset.AS_name} value={asset.AS_id} />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="New Base"
        value={newBase}
        onChangeText={setNewBase}
        editable={!basId}
      />
      <Picker
        selectedValue={basId}
        style={styles.picker}
        onValueChange={(itemValue: number) => {
          setBasId(itemValue);
          setNewBase('');
        }}
        enabled={!newBase}>
        <Picker.Item label="Select Base" value="" />
        {bases.map((base) => (
          <Picker.Item key={base.BAS_id} label={base.BAS_libelle} value={base.BAS_id} />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="New Asset Type"
        value={newAssetType}
        onChangeText={setNewAssetType}
        editable={!assetTypeId}
      />
      <Picker
        selectedValue={assetTypeId}
        style={styles.picker}
        onValueChange={(itemValue: number) => {
          setAssetTypeId(itemValue);
          setNewAssetType('');
        }}
        enabled={!newAssetType}>
        <Picker.Item label="Select Asset Type" value="" />
        {assetTypes.map((assetType) => (
          <Picker.Item key={assetType.AT_id} label={assetType.AT_libelle} value={assetType.AT_id} />
        ))}
      </Picker>

      <Picker
        selectedValue={tagIdForPicker}
        style={styles.picker}
        onValueChange={(itemValue: string) => handleAddTag(itemValue)}>
        <Picker.Item label="Select a Tag" value={null} />
        {tags.map((tag) => (
          <Picker.Item key={tag.TAG_id} label={tag.TAG_libelle} value={tag.TAG_id} />
        ))}
      </Picker>

      <View style={styles.selectedTagsContainer}>
        {selectedTags.map((tagId: number) => {
          const tag: Tag | undefined = tags.find(t => t.TAG_id === tagId)
          return (
            <View key={tagId} style={styles.selectedTag}>
              <Ionicons name="close" size={20} color="black" onPress={() => handleRemoveTag(tagId)} />
              <Text>{tag?.TAG_libelle}</Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{currentReport ? 'Update' : 'Submit'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
