import React from "react";
import { useDispatch } from "react-redux";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  removeFavoriteProject,
  addFavoriteProject,
} from "../../../../redux/actions/Project/project.actions";

const FavoriteProjectComoponent = ({ projectId, isFavorite }) => {
  const dispatch = useDispatch();

  const handleFavProject = (id) => {
    if (isFavorite) {
      dispatch(removeFavoriteProject(id));
    } else {
      dispatch(addFavoriteProject(id));
    }
  };

  return (
    <TouchableOpacity
      onPress={() => handleFavProject(projectId)}
      style={[styles.box, isFavorite ? styles.favorite : styles.unfavorite]}
    >
      <MaterialCommunityIcons
        name={isFavorite ? "pin" : "pin-outline"}
        size={20}
        color={isFavorite ? "#fff" : "#6c757d"}
      />
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  box: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c7cbcf",
    padding: 3,
    alignSelf: "flex-start",
    padding: 4,
    marginRight: 3,
  },
  favorite: {
    backgroundColor: "#dc3545",
  },
  unfavorite: {
    backgroundColor: "#dee2e6",
  },
});
export default FavoriteProjectComoponent;
