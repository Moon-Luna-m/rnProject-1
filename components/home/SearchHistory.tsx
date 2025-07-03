import { createFontStyle } from "@/utils/typography";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import DeleteIcon from "./DeleteIcon";

interface SearchHistoryProps {
  history: string[];
  onClear: () => void;
  onSelect: (keyword: string) => void;
  onDelete?: (keyword: string) => void;
}

export default function SearchHistory({
  history,
  onClear,
  onSelect,
  onDelete,
}: SearchHistoryProps) {
  const { t } = useTranslation();

  if (history.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("home.search.history")}</Text>
        <TouchableOpacity onPress={onClear}>
          <Ionicons name="trash-outline" size={24} color="#0C0A09" />
        </TouchableOpacity>
      </View>
      <View style={styles.historyList}>
        {history.map((item, index) => (
          <View key={index} style={styles.historyItemWrapper}>
            <TouchableOpacity
              style={styles.historyItem}
              onPress={() => onSelect(item)}
            >
              <Text style={styles.historyText}>{item}</Text>
            </TouchableOpacity>
            {onDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onDelete(item)}
              >
                <DeleteIcon />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  title: {
    fontSize: 16,
    ...createFontStyle("600"),
    color: "#0C0A09",
  },
  historyList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  historyItemWrapper: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  historyItem: {
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#A9AEB8",
  },
  historyText: {
    fontSize: 12,
    ...createFontStyle("500"),
    color: "#0C0A09",
  },
  deleteButton: {
    position: "absolute",
    right: -10,
    top: -10,
    padding: 4,
  },
});
