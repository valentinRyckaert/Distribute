import { Ionicons } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { fetchReferenceData, saveReport } from '@/src/lib/api'
import type { ReferenceData, ReportWithTags } from '@/src/lib/types'

interface ReportFormProps {
  /** The report to edit, or null to create a new one. */
  currentReport: ReportWithTags | null
}

const EMPTY_REFERENCE_DATA: ReferenceData = { bases: [], assets: [], assetTypes: [], tags: [] }

/** Form to create a report or edit an existing one, including its category, asset, type and tags. */
export default function ReportForm({ currentReport }: ReportFormProps) {
  const [title, setTitle] = useState(currentReport?.REP_libelle ?? '')
  const [content, setContent] = useState(currentReport?.REP_content ?? '')
  const [solution, setSolution] = useState(currentReport?.REP_solution ?? '')
  const [assetId, setAssetId] = useState<number | null>(currentReport?.AS_id ?? null)
  const [baseId, setBaseId] = useState<number | null>(currentReport?.BAS_id ?? null)
  const [assetTypeId, setAssetTypeId] = useState<number | null>(currentReport?.AT_id ?? null)
  const [selectedTags, setSelectedTags] = useState<number[]>(
    currentReport?.Tag.map((tag) => tag.TAG_id) ?? [],
  )
  const [newAsset, setNewAsset] = useState('')
  const [newBase, setNewBase] = useState('')
  const [newAssetType, setNewAssetType] = useState('')
  const [reference, setReference] = useState<ReferenceData>(EMPTY_REFERENCE_DATA)

  useEffect(() => {
    fetchReferenceData()
      .then(setReference)
      .catch((error: Error) => Alert.alert('Error', error.message))
  }, [])

  /** Validates the required fields, saves the report and resets the form. */
  async function handleSubmit() {
    if (!title || !content) {
      Alert.alert('Error', 'Both title and content are required.')
      return
    }
    try {
      await saveReport(
        {
          REP_libelle: title,
          REP_content: content,
          REP_solution: solution,
          AS_id: assetId,
          BAS_id: baseId,
          AT_id: assetTypeId,
          tagIds: selectedTags,
        },
        currentReport?.REP_id,
      )
    } catch (error) {
      Alert.alert('Error', (error as Error).message)
      return
    }
    Alert.alert('Success', 'Report updated successfully!')
    setTitle('')
    setContent('')
    setSolution('')
    setAssetId(null)
    setBaseId(null)
    setAssetTypeId(null)
    setSelectedTags([])
  }

  /** Adds a tag to the selection once. */
  function handleAddTag(tagId: number | null) {
    if (tagId && !selectedTags.includes(tagId)) setSelectedTags((prev) => [...prev, tagId])
  }

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
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
        editable={!assetId}
      />
      <Picker
        selectedValue={assetId}
        style={styles.picker}
        onValueChange={(value: number | null) => {
          setAssetId(value)
          setNewAsset('')
        }}
        enabled={!newAsset}
      >
        <Picker.Item label="Select Asset" value={null} />
        {reference.assets.map((asset) => (
          <Picker.Item key={asset.AS_id} label={asset.AS_name} value={asset.AS_id} />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="New Base"
        value={newBase}
        onChangeText={setNewBase}
        editable={!baseId}
      />
      <Picker
        selectedValue={baseId}
        style={styles.picker}
        onValueChange={(value: number | null) => {
          setBaseId(value)
          setNewBase('')
        }}
        enabled={!newBase}
      >
        <Picker.Item label="Select Base" value={null} />
        {reference.bases.map((base) => (
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
        onValueChange={(value: number | null) => {
          setAssetTypeId(value)
          setNewAssetType('')
        }}
        enabled={!newAssetType}
      >
        <Picker.Item label="Select Asset Type" value={null} />
        {reference.assetTypes.map((type) => (
          <Picker.Item key={type.AT_id} label={type.AT_libelle} value={type.AT_id} />
        ))}
      </Picker>

      <Picker selectedValue={null} style={styles.picker} onValueChange={handleAddTag}>
        <Picker.Item label="Select a Tag" value={null} />
        {reference.tags.map((tag) => (
          <Picker.Item key={tag.TAG_id} label={tag.TAG_libelle} value={tag.TAG_id} />
        ))}
      </Picker>

      <View style={styles.selectedTags}>
        {selectedTags.map((tagId) => (
          <View key={tagId} style={styles.selectedTag}>
            <Ionicons
              name="close"
              size={20}
              color="black"
              onPress={() => setSelectedTags((prev) => prev.filter((id) => id !== tagId))}
            />
            <Text>{reference.tags.find((tag) => tag.TAG_id === tagId)?.TAG_libelle}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{currentReport ? 'Update' : 'Submit'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  picker: { marginBottom: 16, backgroundColor: '#fff' },
  selectedTags: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
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
  button: { backgroundColor: '#007BFF', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
