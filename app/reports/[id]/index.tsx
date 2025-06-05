import { supabase } from '@/app/lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Asset, AssetType, Base, Report, Tag } from '../../lib/types';

export default function Index() {
  const [post, setPost] = useState<Report | null>(null);
  const [base, setBase] = useState<Base | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [assetType, setAssetType] = useState<AssetType | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const local = useLocalSearchParams();

  useEffect(() => {
    fetchPost();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
          setIsAdmin(user.role === "admin");
      } else {
          setError("User not logged in");
      }
  };

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


  const handleValidationSubmit = async () => {
      const { error } = await supabase
          .from('Report')
          .update({ REP_is_solution_validated: !post?.REP_is_solution_validated })
          .eq('REP_id', post?.REP_id);

      if (error) {
          console.error(error);
          setError("Failed to update validation status.");
      } else {
          alert("Validation status updated successfully!");
      }
  };

  if (!post) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
      
    );
  }

  if (error) {
      return (
          <View style={styles.container}>
              <Text style={styles.error}>{error}</Text>
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
        <View style={styles.container}>
            <Text style={styles.title}>Report Solution</Text>
            <View style={styles.solutionContainer}>
                <Text style={styles.solutionText}>
                    {post.REP_solution || "This report has currently no solution. If you want to propose one, please contact the creator of this report."}
                </Text>
                <Text style={styles.validationStatus}>
                    {post.REP_is_solution_validated ? "This solution has been validated." : "This solution has not been validated yet."}
                </Text>
            </View>
            {isAdmin && (
                <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Validate Solution</Text>
                    <View style={styles.switchContainer}>
                        <Text>{post.REP_is_solution_validated ? "Validated" : "Not Validated"}</Text>
                    </View>
                    <Button title="Change value" onPress={handleValidationSubmit} />
                </View>
            )}
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
      solutionContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 5,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    solutionText: {
        fontSize: 16,
        marginBottom: 10,
    },
    validationStatus: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#555',
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 2,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
});
