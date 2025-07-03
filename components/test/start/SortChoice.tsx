import { createFontStyle } from "@/utils/typography";
import { Feather } from "@expo/vector-icons";
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  Droppable,
  DroppableProvided,
  DropResult,
} from "@hello-pangea/dnd";
import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  DragEndParams,
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";

interface SortOption {
  id: string;
  text: string;
}

interface SortChoiceProps {
  question: string;
  description: string;
  options: SortOption[];
  sortedOptions?: SortOption[];
  onSort: (value: SortOption[]) => void;
}

const MobileSortChoice: React.FC<SortChoiceProps> = ({
  question,
  description,
  options,
  sortedOptions,
  onSort,
}) => {
  const [data, setData] = useState<SortOption[]>(sortedOptions || options);

  useEffect(() => {
    setData(sortedOptions || options);
  }, [sortedOptions, options]);

  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<SortOption>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.sortItem,
            { marginVertical: 12 },
            {
              backgroundColor: isActive ? "#FFFFFF" : "transparent",
              boxShadow: isActive
                ? "0px 4px 11px 0px rgba(36, 164, 179, 0.12)"
                : "none",
              marginTop: getIndex() === 0 ? 12 : 0,
            },
          ]}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              borderBottomWidth: getIndex() === data.length - 1 ? 0 : 1,
              borderBottomColor: "#E4EBF0",
            }}
          >
            <View style={styles.indexContainer}>
              <Text style={styles.indexText}>{item.id}</Text>
            </View>
            <Text style={styles.itemText} numberOfLines={1}>
              {item.text}
            </Text>
            <Feather name="menu" size={24} color="#9B9A9A" />
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const handleDragEnd = ({ data: newData }: DragEndParams<SortOption>) => {
    setData(newData);
    onSort(newData);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.question}>{question}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.sortContainer}>
        <DraggableFlatList
          data={data}
          onDragEnd={handleDragEnd}
          keyExtractor={(item: SortOption) => item.id}
          renderItem={renderItem}
          style={{
            borderRadius: 12,
            backgroundColor: "rgba(228, 235, 240, 0.2)",
          }}
        />
      </View>
    </View>
  );
};

const WebSortChoice: React.FC<SortChoiceProps> = ({
  question,
  description,
  options,
  sortedOptions,
  onSort,
}) => {
  const [data, setData] = useState<SortOption[]>(sortedOptions || options);

  useEffect(() => {
    setData(sortedOptions || options);
  }, [sortedOptions, options]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(data);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setData(items);
    onSort(items);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.question}>{question}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.sortContainer}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable">
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  borderRadius: 12,
                  backgroundColor: "rgba(228, 235, 240, 0.2)",
                }}
              >
                {data.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(
                      provided: DraggableProvided,
                      snapshot: DraggableStateSnapshot
                    ) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          paddingBottom: 12,
                          paddingTop: index === 0 ? 12 : 0,
                          ...provided.draggableProps.style,
                        }}
                      >
                        <div
                          style={{
                            ...styles.sortItem,
                            backgroundColor: snapshot.isDragging
                              ? "#FFFFFF"
                              : "transparent",
                            boxShadow: snapshot.isDragging
                              ? "0px 4px 11px 0px rgba(36, 164, 179, 0.12)"
                              : "none",
                          }}
                        >
                          <View
                            style={{
                              flex: 1,
                              flexDirection: "row",
                              alignItems: "center",
                              paddingVertical: 12,
                              borderBottomWidth:
                                index === data.length - 1 ? 0 : 1,
                              borderBottomColor: "#E4EBF0",
                            }}
                          >
                            <View style={styles.indexContainer}>
                              <Text style={styles.indexText}>{item.id}</Text>
                            </View>
                            <Text style={styles.itemText} numberOfLines={1}>
                              {item.text}
                            </Text>
                            <Feather name="menu" size={24} color="#9B9A9A" />
                          </View>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </View>
    </View>
  );
};

export const SortChoice: React.FC<SortChoiceProps> = (props) => {
  return Platform.OS === "web" ? (
    <WebSortChoice {...props} />
  ) : (
    <MobileSortChoice {...props} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  question: {
    ...createFontStyle("600"),
    fontSize: 20,
    lineHeight: 25.2,
    color: "#0C0A09",
    marginBottom: 8,
  },
  description: {
    ...createFontStyle("400"),
    fontSize: 14,
    lineHeight: 17.64,
    color: "#72818F",
    marginBottom: 24,
  },
  sortContainer: {
    marginTop: 44,
    paddingHorizontal: 24,
  },
  sortItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingLeft: 12,
    paddingRight: 12,
    // marginTop: 12,
    // marginBottom: 12,
  },
  indexContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  indexText: {
    ...createFontStyle("700"),
    fontSize: 16,
    color: "#0C0A09",
  },
  itemText: {
    flex: 1,
    ...createFontStyle("400"),
    fontSize: 16,
    lineHeight: 20.16,
    color: "#0C0A09",
    marginRight: 12,
  },
});
