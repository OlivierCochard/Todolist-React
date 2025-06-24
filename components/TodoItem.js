import React from "react";
import { Image, View, Text, Switch, Pressable } from 'react-native';
import Style from '../Style/Style';

export default function TodoItem({ item, updateTodo, deleteTodo }) {
    const toggleDone = () => {
        updateTodo(item.id, !item.completed);
    };

    return (
        <View style={Style.item}>
            <Switch 
                value={item.completed} 
                onValueChange={toggleDone}
                style={Style.switch}
                accessibilityLabel={`Marquer la tâche ${item.task} comme ${item.completed ? 'non complétée' : 'complétée'}`}
                
                thumbColor={"black"}
                trackColor={{ false: 'white', true: 'white' }}
            />
            <Text style={[Style.itemText, { textDecorationLine: item.completed ? 'line-through' : 'none' }]}>
                {item.task}
            </Text>
            <Pressable onPress={() => deleteTodo(item.id)} accessibilityLabel={`Supprimer la tâche ${item.task}`}>
                <Image source={require('../assets/bin.png')} style={Style.icon} />
            </Pressable>
        </View>
    );
}