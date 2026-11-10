import { Ionicons } from '@expo/vector-icons'
import { Picker } from '@react-native-picker/picker'
import React, { useEffect, useState } from 'react'
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native'
import ReportCard from '@/src/components/ReportCard'
import { fetchReferenceData, searchReports } from '@/src/lib/api'
import type { ReferenceData, ReportWithTags } from '@/src/lib/types'

type FilterType = 'base' | 'asset' | 'assetType' | 'tag'

interface SelectedOption {
  id: number
  libelle: string
  type: FilterType
}

const SEARCH_DELAY_MS = 300

const EMPTY_REFERENCE_DATA: ReferenceData = { bases: [], assets: [], assetTypes: [], tags: [] }

/** Search screen: text search plus category, asset, type and tag filters shown as removable chips. */
export default function SearchScreen() {
  const [searchText, setSearchText] = useState('')
  const [reports, setReports] = useState<ReportWithTags[]>([])
  const [reference, setReference] = useState<ReferenceData>(EMPTY_REFERENCE_DATA)
  const [baseId, setBaseId] = useState<number | null>(null)
  const [assetId, setAssetId] = useState<number | null>(null)
  const [assetTypeId, setAssetTypeId] = useState<number | null>(null)
  const [tagIds, setTagIds] = useState<number[]>([])
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([])

  useEffect(() => {
    fetchReferenceData()
      .then(setReference)
      .catch((error: Error) => Alert.alert(error.message))
  }, [])

  useEffect(() => {
    let stale = false
    // Wait for a pause in typing, and drop answers that arrive after a newer search started.
    const timer = setTimeout(() => {
      searchReports({ text: searchText, baseId, assetId, assetTypeId, tagIds })
        .then((found) => !stale && setReports(found))
        .catch((error: Error) => Alert.alert(error.message))
    }, SEARCH_DELAY_MS)
    return () => {
      stale = true
      clearTimeout(timer)
    }
  }, [searchText, baseId, assetId, assetTypeId, tagIds])

  /** Applies a filter and shows it as a chip; a new category, asset or type replaces the previous one. */
  function handleSelectOption(type: FilterType, id: number, libelle: string) {
    if (type === 'tag' && tagIds.includes(id)) return
    if (type === 'base') setBaseId(id)
    if (type === 'asset') setAssetId(id)
    if (type === 'assetType') setAssetTypeId(id)
    if (type === 'tag') setTagIds((prev) => [...prev, id])
    setSelectedOptions((prev) => [
      ...prev.filter((option) => type === 'tag' || option.type !== type),
      { id, libelle, type },
    ])
  }

  /** Removes a filter and its chip. */
  function handleRemoveOption(type: FilterType, id: number) {
    if (type === 'base') setBaseId(null)
    if (type === 'asset') setAssetId(null)
    if (type === 'assetType') setAssetTypeId(null)
    if (type === 'tag') setTagIds((prev) => prev.filter((tagId) => tagId !== id))
    setSelectedOptions((prev) =>
      prev.filter((option) => !(option.id === id && option.type === type)),
    )
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Rechercher par nom"
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      <View style={styles.pickers}>
        <FilterPicker
          placeholder="Select a Category"
          items={reference.bases.map((b) => ({ id: b.BAS_id, label: b.BAS_libelle }))}
          onSelect={(id, label) => handleSelectOption('base', id, label)}
        />
        <FilterPicker
          placeholder="Select an Asset"
          items={reference.assets.map((a) => ({ id: a.AS_id, label: a.AS_name }))}
          onSelect={(id, label) => handleSelectOption('asset', id, label)}
        />
        <FilterPicker
          placeholder="Select an Asset Type"
          items={reference.assetTypes.map((t) => ({ id: t.AT_id, label: t.AT_libelle }))}
          onSelect={(id, label) => handleSelectOption('assetType', id, label)}
        />
        <FilterPicker
          placeholder="Select a Tag"
          items={reference.tags.map((t) => ({ id: t.TAG_id, label: t.TAG_libelle }))}
          onSelect={(id, label) => handleSelectOption('tag', id, label)}
        />
      </View>

      <View style={styles.chips}>
        {selectedOptions.map((option) => (
          <View key={`${option.type}-${option.id}`} style={styles.chip}>
            <Ionicons
              name="close"
              size={20}
              color="black"
              onPress={() => handleRemoveOption(option.type, option.id)}
            />
            <Text>{option.libelle}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={reports}
        keyExtractor={(report) => report.REP_id.toString()}
        renderItem={({ item }) => <ReportCard report={item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

interface FilterPickerProps {
  placeholder: string
  items: { id: number; label: string }[]
  onSelect: (id: number, label: string) => void
}

/** A picker that reports the chosen item's id and label, then goes back to its placeholder. */
function FilterPicker({ placeholder, items, onSelect }: FilterPickerProps) {
  return (
    <Picker<number | null>
      selectedValue={null}
      style={styles.picker}
      onValueChange={(id) => {
        const item = items.find((candidate) => candidate.id === id)
        if (item) onSelect(item.id, item.label)
      }}
    >
      <Picker.Item label={placeholder} value={null} />
      {items.map((item) => (
        <Picker.Item key={item.id} label={item.label} value={item.id} />
      ))}
    </Picker>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#ffffff',
  },
  pickers: { marginBottom: 20 },
  picker: { height: 50, width: '100%', marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e9ecef',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  list: { paddingBottom: 20 },
})
