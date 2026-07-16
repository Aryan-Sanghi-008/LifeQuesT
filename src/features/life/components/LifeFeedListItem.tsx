import { memo } from "react";
import { View } from "react-native";
import EventCard from "@components/EventCard";
import { AgeSectionHeader } from "@features/life/components/AgeSectionHeader";
import type { FeedItem } from "@features/life/lifeFeed";

type FeedListItemProps = {
  item: FeedItem;
  characterAge: number;
  isProcessing: boolean;
  horizontalPadding: number;
};

export const LifeFeedListItem = memo(function LifeFeedListItem({
  item,
  characterAge,
  isProcessing,
  horizontalPadding,
}: FeedListItemProps) {
  if (item.kind === "header") {
    return (
      <AgeSectionHeader age={item.age} isStageTransition={item.isStageTransition} />
    );
  }
  const isNewestAge = item.event.age === characterAge;
  return (
    <View style={{ paddingHorizontal: horizontalPadding }}>
      <EventCard
        event={item.event}
        isNew={isNewestAge && !isProcessing}
        staggerIndex={item.staggerIndex}
      />
    </View>
  );
});
