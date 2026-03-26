import { AntDesign } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity } from 'react-native'
import colors from '../../constants/Colors'

export const ButtonCloseCircle = ({customStyles, handleClick}) => {
  return (
    <TouchableOpacity
    style={customStyles}
    onPress={handleClick}
  >
    <AntDesign name="closecircle" size={32} color={colors.gray_400} />
  </TouchableOpacity>
  )
}