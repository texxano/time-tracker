import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import http from '../../services/http';


const SearchableDropdown = ({ label, selectedValue, onValueChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownData, setDropdownData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch data based on the search term
  const handleSearch = async (val) => {
    if (!val) {
      setDropdownData([]); // Clear dropdown when search is empty
      return;
    }

    setSearchTerm(val);
    setIsLoading(true);
    setIsSearching(true);

    try {
      const response = await http.get(`/projects/globalsearch?searchType=0&search=${val.toLowerCase()}`);
      if (response && response.list) {
        const newData = response.list.map(item => ({
          label: item.project,
          value: item.projectId,
        }));
        setDropdownData(newData);
      }
    } catch (error) {
      console.error('API error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle item selection from the dropdown
  const handleSelect = (item) => {
    onValueChange(item.value);
    setSearchTerm(item.label);
    setDropdownData([]); // Clear dropdown after selection
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Search Input */}
      <TextInput
        style={styles.input}
        value={searchTerm}
        onChangeText={handleSearch}
        placeholder="Search for a project..."
      />

      {/* Loading indicator */}
      {isLoading && <ActivityIndicator size="small" color="#0000ff" />}

      {/* Dropdown List */}
      {isSearching && dropdownData.length > 0 && (
        <FlatList
          data={dropdownData}
          keyExtractor={(item) => item.value.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.itemText}>{item.label}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
        />
      )}

      {/* No results message */}
      {isSearching && dropdownData.length === 0 && !isLoading && (
        <Text style={styles.noResults}>No projects found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  dropdown: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    maxHeight: 180,
    marginTop: 5,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  itemText: {
    fontSize: 16,
  },
  noResults: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default SearchableDropdown;
