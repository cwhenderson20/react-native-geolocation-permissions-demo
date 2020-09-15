import React from 'react';
import {
  Button as RNButton,
  ButtonProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

type Props = {
  style?: StyleProp<ViewStyle>;
  buttonColor?: string;
} & ButtonProps;

const Button: React.FC<Props> = ({
  buttonColor = 'lightgray',
  color = 'black',
  style,
  ...rest
}) => (
  <View style={[{ backgroundColor: buttonColor, borderRadius: 4 }, style]}>
    <RNButton color={color} {...rest} />
  </View>
);

export default Button;
