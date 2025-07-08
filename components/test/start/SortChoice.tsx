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
    // setData(sortedOptions || options);
  }, [sortedOptions, options]);

  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<SortOption>) => {
    return (
      <ScaleDecorator activeScale={1}>
        <TouchableOpacity
          activeOpacity={1}
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.sortItem,
            { marginVertical: 12 },
            {
              backgroundColor: isActive
                ? "rgba(25, 219, 242, 0.12)"
                : "#F3F4F6",
              boxShadow: isActive ? "0px 1px 8px 0px #B4C7DF" : "none",
              marginTop: getIndex() === 0 ? 12 : 0,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: isActive ? "#19DBF2" : "transparent",
            },
          ]}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
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
    // console.log(newData);
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
          keyExtractor={(item: SortOption) => String(item.id)}
          renderItem={renderItem}
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
              <div {...provided.droppableProps} ref={provided.innerRef}>
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
                              ? "rgba(25, 219, 242, 0.12)"
                              : "#F3F4F6",
                            boxShadow: snapshot.isDragging
                              ? "0px 1px 8px 0px #B4C7DF"
                              : "none",
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: snapshot.isDragging
                              ? "#19DBF2"
                              : "transparent",
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
    // flex: 1,
  },
  content: {
    // paddingHorizontal: 24,
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
    color: "#515C66",
    marginBottom: 16,
  },
  sortContainer: {
    // paddingHorizontal: 24,
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
