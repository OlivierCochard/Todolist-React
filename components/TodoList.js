import React from 'react';
import { FlatList, Text, View } from 'react-native';
import TodoItem from './TodoItem';
import Style from '../Style/Style';

export default function TodoList({ data, deleteTodo, updateTodo }) {
    return (
        <View style={Style.listContainer}>
            <FlatList
                data={data}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TodoItem item={item} deleteTodo={deleteTodo} updateTodo={updateTodo} />
                )}
            />
        </View>
    );
}
