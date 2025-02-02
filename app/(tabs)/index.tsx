import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '../db/supabase';

export default function Index() {
  const [latestPosts, setLatestPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchLatestPosts();
    fetchCategories();
  }, []);

  const fetchLatestPosts = async () => {
    const { data, error } = await supabase
      .from('Report')
      .select('*')
      .order('REP_created_at', { ascending: false })
      .limit(5);
    
    if (error) console.error(error);
    else {
      setLatestPosts(data);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('Base')
      .select('*');
    if (error) console.error(error);
    else setCategories(data.map((cat: any) => cat));
  };

  const renderPost = ({ item }: { item: any }) => (
    <TouchableOpacity className="p-4 border-b border-gray-300">
      <Text className="text-lg font-bold">{item.REP_libelle}</Text>
      <Text className="text-gray-600">{item.REP_created_at}</Text>
    </TouchableOpacity>
  )

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">Welcome to the Blog!</Text>
      
      <Text className="text-xl font-semibold mb-2">Latest Posts</Text>
      <FlatList
        data={latestPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.REP_id}
      />
      
      <Text className="text-xl font-semibold mt-4 mb-2">Categories</Text>
      <View className="flex-row flex-wrap">
        {categories.map((object: any) =>
          <Text key={object.BAS_id} className="bg-blue-500 text-white px-3 py-1 rounded-full m-1">
            {object.BAS_libelle}
          </Text>
        )}
      </View>
    </View>
  );
};