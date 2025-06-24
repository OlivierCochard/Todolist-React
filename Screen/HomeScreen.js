import React, {useContext} from 'react';
import { View, Text } from 'react-native';
import { TokenContext } from '../Context/Context';
import Style from '../Style/Style';

const HomeScreen = () => {
  const [token] = useContext(TokenContext);

  return (
    <View style={Style.main}>
      <Text style={Style.title}>Bienvenue, vous êtes connecté en tant que '{token ? token.login : 'Unknow'}'.</Text>
    </View>
  );
};

export default HomeScreen;
