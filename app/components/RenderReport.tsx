import { Link } from "expo-router";
import { Text, Pressable, StyleSheet } from "react-native";
import { Report } from '../lib/types';

interface ReportProps {
  item: Report;
}

export default function RenderReport({ item }: ReportProps) {
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
            </Pressable>
          </Link>
    )
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
  }
})