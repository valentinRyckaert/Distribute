import React, { useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, Picker } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ReportForm({currentReport}: any|null ) {

    const [title, setTitle] = useState(currentReport ? currentReport.REP_libelle : '');
    const [content, setContent] = useState(currentReport ? currentReport.REP_content : '');
    const [solution, setSolution] = useState(currentReport ? currentReport.REP_solution : '');
    const [asId, setAsId] = useState(currentReport ? currentReport.AS_id : '');
    const [basId, setBasId] = useState(currentReport ? currentReport.BAS_id : '');
    const [assetTypeId, setAssetTypeId] = useState(currentReport ? currentReport.AT_id : '');
    const [assets, setAssets] = useState([]);
    const [bases, setBases] = useState([]);
    const [assetTypes, setAssetTypes] = useState([]);
    const [newAsset, setNewAsset] = useState('');
    const [newBase, setNewBase] = useState('');
    const [newAssetType, setNewAssetType] = useState('');

    useEffect(() => {
        const fetchAssets = async () => {
            const { data, error }: any = await supabase.from('Asset').select('AS_id, AS_name');
            if (error) {
                Alert.alert('Error', error.message);
            } else {
                setAssets(data);
            }
        };

        const fetchBases = async () => {
            const { data, error }: any = await supabase.from('Base').select('BAS_id, BAS_libelle');
            if (error) {
                Alert.alert('Error', error.message);
            } else {
                setBases(data);
            }
        };

        const fetchAssetTypes = async () => {
            const { data, error }: any = await supabase.from('AssetType').select('AT_id, AT_libelle');
            if (error) {
                Alert.alert('Error', error.message);
            } else {
                setAssetTypes(data);
            }
        };

        fetchAssets();
        fetchBases();
        fetchAssetTypes();
    }, []);

    const handleSubmit = async () => {
        if (!title || !content) {
            Alert.alert('Error', 'Both title and content are required.');
            return;
        }

        const user: any = await supabase.auth.getUser();
        const userId: number = user.data.user?.id;
        
        const lastReport: any = currentReport ? [currentReport] : (await supabase
        .from('Report')
        .select('*')
        .order('REP_created_at', { ascending: false })
        .limit(1)).data ?? []
        const reportID: number = lastReport[0].REP_id
        

        const { error } = currentReport ? await supabase
        .from('Report')
        .update([{
            REP_libelle: title,
            REP_content: content,
            REP_created_at: new Date().toISOString(),
            AS_id: asId ? parseInt(asId) : null,
            BAS_id: basId ? parseInt(basId) : null,
            REP_solution: solution,
            REP_is_solution_validated: false,
            AT_id: assetTypeId ? parseInt(assetTypeId) : null,
            user_id: userId
        }])
        .eq('REP_id', reportID) :
        await supabase
        .from('Report')
        .insert([{
            REP_id: reportID+1,
            REP_libelle: title,
            REP_content: content,
            REP_created_at: new Date().toISOString(),
            AS_id: asId ? parseInt(asId) : null,
            BAS_id: basId ? parseInt(basId) : null,
            REP_solution: solution,
            REP_is_solution_validated: false,
            AT_id: assetTypeId ? parseInt(assetTypeId) : null,
            user_id: userId
        }]);


        if (error) {
        Alert.alert('Error', error.message);
        } else {
        Alert.alert('Success', 'Report created successfully!');
        setTitle('');
        setContent('');
        setSolution('');
        setAsId('');
        setBasId('');
        setAssetTypeId('');
        }
    };


    return (
    <>
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
        />
        <Picker
            selectedValue={asId}
            style={styles.picker}
            onValueChange={(itemValue: any) => setAsId(itemValue)}>
            <Picker.Item label="Select Asset" value="" />
            {assets.map((asset: any) => (
            <Picker.Item key={asset.AS_id} label={asset.AS_name} value={asset.AS_id} />
            ))}
        </Picker>

        <TextInput
            style={styles.input}
            placeholder="New Base"
            value={newBase}
            onChangeText={setNewBase}
        />
        <Picker
            selectedValue={basId}
            style={styles.picker}
            onValueChange={(itemValue: any) => setBasId(itemValue)}>
            <Picker.Item label="Select Base" value="" />
            {bases.map((base: any)  => (
            <Picker.Item key={base.BAS_id} label={base.BAS_libelle} value={base.BAS_id} />
            ))}
        </Picker>

        <TextInput
            style={styles.input}
            placeholder="New Asset Type"
            value={newAssetType}
            onChangeText={setNewAssetType}
        />
        <Picker
            selectedValue={assetTypeId}
            style={styles.picker}
            onValueChange={(itemValue: any) => setAssetTypeId(itemValue)}>
            <Picker.Item label="Select Asset Type" value="" />
            {assetTypes.map((assetType: any) => (
            <Picker.Item key={assetType.AT_id} label={assetType.AT_libelle} value={assetType.AT_id} />
            ))}
        </Picker>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>{currentReport ? 'Update' : 'Submit'}</Text>
        </TouchableOpacity>
    </>
    )
}

const styles = StyleSheet.create({
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
