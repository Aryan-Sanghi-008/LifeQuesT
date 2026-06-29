import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADII, SPACING } from '@theme';
import { ScreenHeader } from '@components/ScreenHeader';
import { useGameStore } from '@store/gameStore';

export function SocialMediaScreen() {
  const character = useGameStore(s => s.character);
  const createSocialPost = useGameStore(s => s.createSocialPost);
  const [content, setContent] = useState('');

  if (!character) return null;

  const posts = [...(character.socialPosts ?? [])].reverse();

  const handlePost = () => {
    const trimmed = content.trim();
    if (!trimmed) {
      Alert.alert('Empty Post', 'Write something to share.');
      return;
    }
    const result = createSocialPost(trimmed);
    Alert.alert(result.ok ? 'Posted!' : 'Failed', result.message);
    if (result.ok) setContent('');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerWrap}>
          <ScreenHeader
            title="LifeFeed"
            subtitle={`${character.socialFollowers.toLocaleString()} followers`}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.compose}>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="What's happening in your life?"
              placeholderTextColor={COLORS.t4}
              style={styles.input}
              multiline
              maxLength={280}
            />
            <Pressable onPress={handlePost} style={styles.postBtn}>
              <Text style={styles.postBtnText}>Post</Text>
            </Pressable>
          </View>

          <Text style={styles.section}>Recent Posts</Text>
          {posts.length === 0 ? (
            <Text style={styles.empty}>No posts yet. Share your story!</Text>
          ) : (
            posts.map(p => (
              <View key={p.id} style={styles.postCard}>
                <Text style={styles.postMeta}>Age {p.age} · {p.platform} · Virality {p.virality}</Text>
                <Text style={styles.postContent}>{p.content}</Text>
                <Text style={styles.postDelta}>+{p.followerDelta} followers</Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },
  headerWrap: { paddingHorizontal: SPACING.lg },
  scroll: { padding: SPACING.lg, gap: SPACING.md },
  compose: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  input: {
    fontFamily: FONTS.body,
    fontSize: 15,
    color: COLORS.t1,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  postBtn: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.orchid,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.sm,
  },
  postBtnText: { fontFamily: FONTS.bodySemiBold, fontSize: 13, color: COLORS.bg },
  section: { fontFamily: FONTS.bodySemiBold, fontSize: 11, color: COLORS.t4, letterSpacing: 1.5, marginTop: SPACING.md },
  empty: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t4 },
  postCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  postMeta: { fontFamily: FONTS.body, fontSize: 10, color: COLORS.t4 },
  postContent: { fontFamily: FONTS.body, fontSize: 14, color: COLORS.t1 },
  postDelta: { fontFamily: FONTS.monoSemiBold, fontSize: 11, color: COLORS.teal },
});
