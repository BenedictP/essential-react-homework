import * as React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMMKVString } from 'react-native-mmkv';
import { Snackbar } from 'react-native-snackbar';

import type { RootStackParamList } from '../navigation/types';
import { getLotteries, type Lottery } from '../services/lottery';
import {
  lotteryRegistrationStorage,
  parseRegisteredLotteryIds,
  REGISTERED_LOTTERY_IDS_KEY,
  serializeRegisteredLotteryIds,
} from '../storage/lotteryRegistrationStorage';
import { RegisterSheet, type RegisterSheetRef } from './RegisterSheet';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();
  const registerSheetRef = React.useRef<RegisterSheetRef>(null);
  const [lotteryNameFilter, setLotteryNameFilter] = React.useState('');
  const [selectedLotteryIds, setSelectedLotteryIds] = React.useState<string[]>(
    [],
  );
  const [registeredLotteryIdsValue, setRegisteredLotteryIdsValue] =
    useMMKVString(REGISTERED_LOTTERY_IDS_KEY, lotteryRegistrationStorage);
  const {
    data: lotteries = [],
    isError,
    isFetching,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['lotteries'],
    queryFn: getLotteries,
  });
  const normalizedLotteryNameFilter = lotteryNameFilter.trim().toLowerCase();
  const filteredLotteries = React.useMemo(() => {
    if (!normalizedLotteryNameFilter) {
      return lotteries;
    }

    return lotteries.filter((lottery) =>
      lottery.name.toLowerCase().includes(normalizedLotteryNameFilter),
    );
  }, [lotteries, normalizedLotteryNameFilter]);
  const selectedLotteryIdSet = React.useMemo(
    () => new Set(selectedLotteryIds),
    [selectedLotteryIds],
  );
  const registeredLotteryIds = React.useMemo(
    () => parseRegisteredLotteryIds(registeredLotteryIdsValue),
    [registeredLotteryIdsValue],
  );
  const registeredLotteryIdSet = React.useMemo(
    () => new Set(registeredLotteryIds),
    [registeredLotteryIds],
  );
  const hasSelectedLotteries = selectedLotteryIds.length > 0;

  React.useEffect(() => {
    setSelectedLotteryIds((currentSelectedLotteryIds) => {
      const lotteryIds = new Set(lotteries.map((lottery) => lottery.id));

      return currentSelectedLotteryIds.filter(
        (lotteryId) =>
          lotteryIds.has(lotteryId) && !registeredLotteryIdSet.has(lotteryId),
      );
    });
  }, [lotteries, registeredLotteryIdSet]);

  React.useEffect(() => {
    if (!route.params?.snackbarMessage) {
      return;
    }

    const snackbarMessage = route.params.snackbarMessage;

    Snackbar.show({
      text: snackbarMessage,
      duration: Snackbar.LENGTH_LONG,
    });

    navigation.setParams({
      snackbarId: undefined,
      snackbarMessage: undefined,
    });
  }, [navigation, route.params?.snackbarId, route.params?.snackbarMessage]);

  function toggleLottery(lotteryId: string) {
    if (registeredLotteryIdSet.has(lotteryId)) {
      return;
    }

    setSelectedLotteryIds((currentSelectedLotteryIds) => {
      if (currentSelectedLotteryIds.includes(lotteryId)) {
        return currentSelectedLotteryIds.filter(
          (selectedLotteryId) => selectedLotteryId !== lotteryId,
        );
      }

      return [...currentSelectedLotteryIds, lotteryId];
    });
  }

  function handlePrimaryAction() {
    if (!hasSelectedLotteries) {
      navigation.navigate('AddLottery');
      return;
    }

    void registerSheetRef.current?.present();
  }

  function handleRegister() {
    const nextRegisteredLotteryIds = serializeRegisteredLotteryIds([
      ...registeredLotteryIds,
      ...selectedLotteryIds,
    ]);

    setRegisteredLotteryIdsValue(nextRegisteredLotteryIds);
    setSelectedLotteryIds([]);
    void registerSheetRef.current?.dismiss();

    Snackbar.show({
      text:
        selectedLotteryIds.length === 1
          ? 'Registered for 1 lottery.'
          : `Registered for ${selectedLotteryIds.length} lotteries.`,
      duration: Snackbar.LENGTH_LONG,
    });
  }

  function renderLottery({ item }: { item: Lottery }) {
    const isRunning = item.status === 'running';
    const isSelected = selectedLotteryIdSet.has(item.id);
    const isRegistered = registeredLotteryIdSet.has(item.id);

    return (
      <Pressable
        accessibilityLabel={
          isRegistered
            ? `${item.name} is already registered`
            : `Select ${item.name}`
        }
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected, disabled: isRegistered }}
        disabled={isRegistered}
        onPress={() => toggleLottery(item.id)}
        style={({ pressed }) => [
          styles.lotteryItem,
          isSelected ? styles.lotteryItemSelected : null,
          isRegistered ? styles.lotteryItemRegistered : null,
          pressed ? styles.lotteryItemPressed : null,
        ]}
      >
        <View
          style={[
            styles.selectionIndicator,
            isSelected ? styles.selectionIndicatorSelected : null,
            isRegistered ? styles.selectionIndicatorRegistered : null,
          ]}
        >
          {isSelected || isRegistered ? (
            <View style={styles.selectionIndicatorDot} />
          ) : null}
        </View>

        <View style={styles.lotteryDetails}>
          <Text style={styles.lotteryName}>{item.name}</Text>
          <Text style={styles.lotteryPrize}>{item.prize}</Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isRunning ? styles.statusBadgeRunning : null,
            isRegistered ? styles.statusBadgeRegistered : null,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isRunning ? styles.statusTextRunning : null,
              isRegistered ? styles.statusTextRegistered : null,
            ]}
          >
            {isRegistered ? 'Registered' : item.status}
          </Text>
        </View>
      </Pressable>
    );
  }

  function renderContent() {
    if (isLoading) {
      return (
        <View style={styles.centerState}>
          <ActivityIndicator accessibilityLabel="Loading lotteries" />
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>Failed to load lotteries.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => refetch()}
            style={({ pressed }) => [
              styles.retryButton,
              pressed ? styles.retryButtonPressed : null,
            ]}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      );
    }

    if (lotteries.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No lotteries available.</Text>
        </View>
      );
    }

    if (filteredLotteries.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Nothing found for {lotteryNameFilter.trim()}.
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        contentContainerStyle={styles.listContent}
        data={filteredLotteries}
        keyExtractor={(item) => item.id}
        extraData={[registeredLotteryIds, selectedLotteryIds]}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => refetch()}
          />
        }
        renderItem={renderLottery}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Lotteries</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Filter lotteries by name"
          clearButtonMode="while-editing"
          onChangeText={setLotteryNameFilter}
          placeholder="Filter by lottery name"
          placeholderTextColor="#9ca3af"
          returnKeyType="search"
          style={styles.searchInput}
          value={lotteryNameFilter}
        />
      </View>

      {renderContent()}

      <Pressable
        accessibilityLabel={
          hasSelectedLotteries ? 'Register selected lotteries' : 'Add lottery'
        }
        accessibilityRole="button"
        onPress={handlePrimaryAction}
        style={({ pressed }) => [
          styles.fab,
          hasSelectedLotteries ? styles.registerButton : null,
          pressed ? styles.fabPressed : null,
        ]}
      >
        <Text
          style={hasSelectedLotteries ? styles.registerText : styles.fabText}
        >
          {hasSelectedLotteries ? 'Register' : '+'}
        </Text>
      </Pressable>

      <RegisterSheet
        onRegister={handleRegister}
        ref={registerSheetRef}
        selectedLotteryCount={selectedLotteryIds.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '600',
  },
  searchInput: {
    minHeight: 48,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    color: '#111827',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  listContent: {
    paddingBottom: 104,
  },
  lotteryItem: {
    minHeight: 88,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  lotteryItemSelected: {
    backgroundColor: '#eff6ff',
  },
  lotteryItemRegistered: {
    opacity: 0.55,
  },
  lotteryItemPressed: {
    opacity: 0.8,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#9ca3af',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIndicatorSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  selectionIndicatorRegistered: {
    borderColor: '#9ca3af',
    backgroundColor: '#9ca3af',
  },
  selectionIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  lotteryDetails: {
    flex: 1,
  },
  lotteryName: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '600',
  },
  lotteryPrize: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 14,
  },
  statusBadge: {
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusBadgeRunning: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeRegistered: {
    backgroundColor: '#e5e7eb',
  },
  statusText: {
    color: '#4b5563',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusTextRunning: {
    color: '#166534',
  },
  statusTextRegistered: {
    color: '#4b5563',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyState: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 104,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabPressed: {
    opacity: 0.8,
  },
  registerButton: {
    width: 'auto',
    minWidth: 132,
    paddingHorizontal: 24,
  },
  fabText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 34,
  },
  registerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
