import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import Style from '../Style/Style';

const SignUpScreen = ({ navigation }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const signUp = async (login, password) => {
    try {
      const response = await fetch('http://localhost:4000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation SignUp($login: String!, $password: String!) {
              signUp(login: $login, password: $password) {
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
          navigation.navigate('SignIn');
        }
      } else {
        setError(data.errors.message);
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

    signUp(login, password);
  };

  return (
    <View style={Style.main}>
      <Text style={Style.title}>S'INSCRIRE</Text>

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
        <Text style={Style.buttonText}>INSCRIPTION</Text>
      </TouchableOpacity>

      <Text style={Style.linkText}>
        Déjà un compte ?{' '}
        <Text style={Style.link} onPress={() => navigation.navigate('SignIn')}>
          Se connecter
        </Text>
      </Text>
    </View>
  );
};

export default SignUpScreen;
