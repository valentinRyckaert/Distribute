import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '@/app/lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import { Report, Base, Asset, AssetType, Tag } from '../../lib/types';

export default function Index() {
  const [post, setPost] = useState<Report | null>(null);
  const [base, setBase] = useState<Base | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [assetType, setAssetType] = useState<AssetType | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);

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
      const reportData = data[0];
      setPost(reportData);
      localStorage.setItem("currentReport", JSON.stringify(reportData));

      if (reportData.BAS_id) {
        const { data: baseData, error: baseError } = await supabase
          .from('Base')
          .select('*')
          .eq('BAS_id', reportData.BAS_id)
          .single();

        if (baseError) console.error(baseError);
        else setBase(baseData);
      }

      if (reportData.AS_id) {
        const { data: assetData, error: assetError } = await supabase
          .from('Asset')
          .select('*')
          .eq('AS_id', reportData.AS_id)
          .single();

        if (assetError) console.error(assetError);
        else setAsset(assetData);
      }

      if (reportData.AT_id) {
        const { data: assetTypeData, error: assetTypeError } = await supabase
          .from('AssetType')
          .select('*')
          .eq('AT_id', reportData.AT_id)
          .single();

        if (assetTypeError) console.error(assetTypeError);
        else setAssetType(assetTypeData);
      }

      const { data: tagsData, error: tagsError } = await supabase
        .from('ReportHasTag')
        .select('Tag(TAG_libelle, TAG_id)')
        .eq('REP_id', reportData.REP_id);

      if (tagsError) console.error(tagsError);
      else setTags(tagsData.map((tag: any) => tag.Tag));
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

        {base && <Text style={styles.base}>Base: {base.BAS_libelle}</Text>}
        {asset && <Text style={styles.asset}>Asset: {asset.AS_name}</Text>}
        {assetType && <Text style={styles.assetType}>Asset Type: {assetType.AT_libelle}</Text>}

        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <View key={tag.TAG_id} style={styles.tag}>
              <Text style={styles.tagText}>#{tag.TAG_libelle}</Text>
            </View>
          ))}
        </View>
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
  },
  base: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  asset: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  assetType: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#007BFF',
    fontSize: 14,
  },
});
