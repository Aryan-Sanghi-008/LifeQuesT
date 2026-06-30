import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedStyles, useTheme } from '@theme';
import { ScreenHeader } from '@components/ScreenHeader';
import { useGameStore } from '@store/gameStore';

export function SocialMediaScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
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
              placeholderTextColor={colors.t4}
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

const createStyles = ({ colors, fonts, spacing, radii }: ReturnType<typeof useTheme>) => StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  headerWrap: { paddingHorizontal: spacing.lg },
  scroll: { padding: spacing.lg, gap: spacing.md },
  compose: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.t1,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  postBtn: {
    alignSelf: 'flex-end',
    backgroundColor: colors.orchid,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
  },
  postBtnText: { fontFamily: fonts.bodySemiBold, fontSize: 13, color: colors.bg },
  section: { fontFamily: fonts.bodySemiBold, fontSize: 11, color: colors.t4, letterSpacing: 1.5, marginTop: spacing.md },
  empty: { fontFamily: fonts.body, fontSize: 13, color: colors.t4 },
  postCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  postMeta: { fontFamily: fonts.body, fontSize: 10, color: colors.t4 },
  postContent: { fontFamily: fonts.body, fontSize: 14, color: colors.t1 },
  postDelta: { fontFamily: fonts.monoSemiBold, fontSize: 11, color: colors.teal },
});
