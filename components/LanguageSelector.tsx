import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LANGUAGES, setLanguage } from '../utils/i18n';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const handleLanguageChange = async (language: string) => {
    await setLanguage(language);
  };

  return (
    <View style={styles.container}>
      {Object.values(LANGUAGES).map((lang) => (
        <TouchableOpacity
          key={lang.value}
          style={[
            styles.button,
            currentLanguage === lang.value && styles.activeButton,
          ]}
          onPress={() => handleLanguageChange(lang.value)}
        >
          <Text
            style={[
              styles.buttonText,
              currentLanguage === lang.value && styles.activeButtonText,
            ]}
          >
            {lang.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'red',
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  activeButtonText: {
    color: '#fff',
  },
});

export default LanguageSelector;