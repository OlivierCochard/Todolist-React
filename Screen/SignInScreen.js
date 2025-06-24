import React, { useState, useContext } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { TokenContext } from '../Context/Context';
import Style from '../Style/Style';

const SignInScreen = ({ navigation }) => {
  const [token, setToken] = useContext(TokenContext);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const signIn = async (login, password) => {
    try {
      const response = await fetch('http://localhost:4000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation SignIn($login: String!, $password: String!) {
              signIn(login: $login, password: $password) {
                token
                user {
                  id
                  login
                }
              }
            }
          `,
          variables: {
            login,
            password,
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.errors && data.errors.length != 0){
          setError(data.errors[0].message);
        }
        else{
          const userData = data.data.signIn.user
          setToken(userData);
        }
      } 
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSubmit = () => {
    if (!login || !password) {
      setError('Tous les champs doivent être remplis.');
      return;
    }

    signIn(login, password);
  };

  return (
    <View style={Style.main}>
      <Text style={Style.title}>SE CONNECTER</Text>

      {error ? <Text style={Style.errorText}>{error}</Text> : null}

      <TextInput
        style={Style.input}
        placeholder="Pseudo..."
        value={login}
        onChangeText={setLogin}
      />
      <TextInput
        style={Style.input}
        placeholder="Mot de passe..."
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={Style.button} onPress={handleSubmit}>
        <Text style={Style.buttonText}>CONNEXION</Text>
      </TouchableOpacity>

      <Text style={Style.linkText}>
        Pas encore de compte ?{' '}
        <Text style={Style.link} onPress={() => navigation.navigate('SignUp')}>
          S'inscrire
        </Text>
      </Text>
    </View>
  );
};

export default SignInScreen;
