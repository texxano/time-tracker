import { StyleSheet, Platform } from 'react-native';

export const userConfigStyles = StyleSheet.create({

  container: {
    backgroundColor: '#ebf0f3',
    padding: 15,
    borderRadius: 5,
    height: 'auto',
    flex: 1,
  },
  title: {
    fontSize: 20,
    color: "#6c757d",
    fontWeight: '600',
  },
  itemContainer: {
    marginVertical: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  userDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10
  },
  userName: {
    fontSize: 20,
    paddingLeft: 10,
    fontWeight: Platform.OS === 'ios' ? '500' : '400',
  },
  priceInfo: {
    flexDirection: 'row',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: Platform.OS === 'ios' ? '500' : '400'

  },
  itemFeatureUserTime: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#ccc",
    marginVertical: 3,
    padding: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});
