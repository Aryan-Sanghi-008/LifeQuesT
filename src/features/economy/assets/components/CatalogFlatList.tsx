import { FlatList, ListRenderItem, StyleProp, ViewStyle } from "react-native";

type CatalogFlatListProps<T> = {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: ListRenderItem<T>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  ListHeaderComponent?: React.ReactElement | null;
};

export function CatalogFlatList<T>({
  data,
  keyExtractor,
  renderItem,
  contentContainerStyle,
  ListHeaderComponent,
}: CatalogFlatListProps<T>) {
  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      scrollEnabled={false}
      nestedScrollEnabled
      contentContainerStyle={contentContainerStyle}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
}
