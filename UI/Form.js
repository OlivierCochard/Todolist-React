import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Style from '../Style/Style';

const Form = ({ newTask, setNewTask, onPress }) => {
    return (
        <View style={Style.formContainer}>
            <TextInput
                style={Style.inputForm}
                placeholder="Titre..."
                placeholderTextColor="#93B1A6"
                value={newTask}
                onChangeText={setNewTask}
            />
            <TouchableOpacity style={Style.buttonForm} onPress={onPress}>
                <Text style={Style.buttonText}>Ajouter</Text>
            </TouchableOpacity>
        </View>
    );
}

export default Form;
