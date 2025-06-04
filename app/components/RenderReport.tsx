import { Link } from "expo-router";
import { Text, Pressable, StyleSheet, View } from "react-native";
import { Report, Tag } from '../lib/types';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';

interface ReportProps {
  item: Report;
}

export default function RenderReport({ item }: ReportProps) {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      const { data, error } = await supabase
        .from('ReportHasTag')
        .select('TAG_id, Tag(TAG_libelle)')
        .eq('REP_id', item.REP_id);

      if (error) {
        console.error('Error fetching tags:', error);
      } else {
        setTags(data.map((reportHasTag: any) => ({
          TAG_id: reportHasTag.TAG_id,
          TAG_libelle: reportHasTag.Tag.TAG_libelle
        })));
      }
    };

    fetchTags();
  }, [item.REP_id]);

  return (
    <Link
      href={{
        pathname: '/reports/[id]',
        params: { id: item.REP_id }
      }}
      style={styles.postItem}
      asChild
      key={item.REP_id}
    >
      <Pressable>
        <Text style={styles.postTitle}>{item.REP_libelle}</Text>
        <Text style={styles.postDate}>{new Date(item.REP_created_at).toLocaleDateString()}</Text>
        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <View key={tag.TAG_id} style={styles.tag}>
              <Text style={styles.tagText}>#{tag.TAG_libelle}</Text>
            </View>
          ))}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
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
