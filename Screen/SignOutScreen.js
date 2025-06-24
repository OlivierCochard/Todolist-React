import React, { useContext } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { TokenContext } from '../Context/Context';
import Style from '../Style/Style';

const SignOutScreen = () => {
  const [token, setToken] = useContext(TokenContext);
  const handleSignOut = () => {
    setToken(null);
  };

  return (
    <View style={Style.main}>
      <Text style={Style.title}>se déconnecter</Text>
      <TouchableOpacity style={Style.button} onPress={handleSignOut}>
        <Text style={Style.buttonText}>se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

export default SignOutScreen;