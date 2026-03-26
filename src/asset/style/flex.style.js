import { StyleSheet } from 'react-native';

const flex = StyleSheet.create({
  flex_1: {
    flex: 1,
  },
  d_flex_center: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  d_flex_between: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  flex_start: {
    justifyContent: 'flex-start',
  },
  flex_end: {
    justifyContent: 'flex-end',
  },
  flex_between: {
    justifyContent: 'space-between',
  },
  space_evenly: {
    justifyContent: 'space-evenly',
  },
  flex_direction_row: {
    flexDirection: 'row',
  },
  flex_direction_column: {
    flexDirection: 'column',
  },
  flex_alignself: {
    alignSelf: 'center',
  },
  flex_wrap: {
    flexWrap: 'wrap',
  },
});

export default flex;
