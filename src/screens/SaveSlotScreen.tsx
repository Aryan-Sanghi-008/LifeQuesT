import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { useGameStore } from '../store/gameStore';
import { GradientButton, Card } from '../components/index';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SaveSlots'>;
};

export function SaveSlotScreen({ navigation }: Props) {
  const slots = useGameStore(s => s.slotList.length > 0 ? s.slotList : s.listSlots());
  const slotsSynced = useGameStore(s => s.slotsSynced);
  const loadSlot = useGameStore(s => s.loadSlot);
  const deleteSlot = useGameStore(s => s.deleteSlot);
  const refreshSlotList = useGameStore(s => s.refreshSlotList);
  const user = useGameStore(s => s.user);

  useEffect(() => {
    if (user && !user.uid.startsWith('local_guest_')) {
      void refreshSlotList();
    }
  }, [user, refreshSlotList]);

  const handleSelect = async (slotId: string, empty: boolean) => {
    if (empty) {
      useGameStore.setState({
        activeSlotId: slotId,
        character: null,
        pendingDecision: null,
      });
      navigation.replace('CharacterCreate');
      return;
    }
    await loadSlot(slotId);
    const char = useGameStore.getState().character;
    if (char?.isAlive) navigation.replace('MainTabs');
    else navigation.replace('Death');
  };

  const handleDelete = (slotId: string, name: string) => {
    Alert.alert('Delete Life', `Delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => void deleteSlot(slotId) },
    ]);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Your Lives</Text>
        <Text style={styles.sub}>
          {user?.displayName ? `Playing as ${user.displayName}` : 'Choose a save slot'}
          {slotsSynced ? ' · Cloud synced' : ''}
        </Text>

        {slots.map(slot => {
          const empty = slot.updatedAt === 0;
          return (
            <Card key={slot.slotId} style={styles.card}>
              <Pressable
                onPress={() => void handleSelect(slot.slotId, empty)}
                style={styles.row}
                accessibilityRole="button"
                accessibilityLabel={empty ? `Empty slot ${slot.slotId}, start new life` : `Load ${slot.name}, age ${slot.age}`}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.slotName}>{empty ? 'Empty Slot' : slot.name}</Text>
                  <Text style={styles.slotMeta}>
                    {empty ? 'Start a new life' : `Age ${slot.age} · ${slot.isAlive ? 'Alive' : 'Deceased'}`}
                  </Text>
                </View>
                {!empty && (
                  <Pressable
                    onPress={() => handleDelete(slot.slotId, slot.name)}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete save ${slot.name}`}
                  >
                    <Text style={styles.delete}>Delete</Text>
                  </Pressable>
                )}
              </Pressable>
            </Card>
          );
        })}

        <GradientButton
          label="New Life"
          accessibilityLabel="Start a new life"
          onPress={() => {
            const empty = slots.find(s => s.updatedAt === 0);
            const slotId = empty?.slotId ?? '0';
            useGameStore.setState({ activeSlotId: slotId });
            navigation.navigate('CharacterCreate', undefined);
          }}
          style={{ marginTop: SPACING.xl }}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1, padding: SPACING.lg },
  title: { fontFamily: FONTS.displayBold, fontSize: 28, color: COLORS.t1, marginBottom: SPACING.xs },
  sub: { fontFamily: FONTS.body, fontSize: 13, color: COLORS.t3, marginBottom: SPACING.xl },
  card: { marginBottom: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  slotName: { fontFamily: FONTS.bodySemiBold, fontSize: 16, color: COLORS.t1 },
  slotMeta: { fontFamily: FONTS.body, fontSize: 12, color: COLORS.t4, marginTop: 2 },
  delete: { fontFamily: FONTS.bodySemiBold, fontSize: 12, color: COLORS.crimson },
});
