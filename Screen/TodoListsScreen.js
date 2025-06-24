import React, { useEffect, useContext, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { TokenContext } from '../Context/Context';
import Style from '../Style/Style';
import Form from '../UI/Form';

const TodoListsScreen = ({ navigation }) => {
  const [token] = useContext(TokenContext);
  const [todoLists, setTodoLists] = useState([]);
  const [error, setError] = useState('');
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [renameId, setRenameId] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    const fetchTodoLists = async () => {
      if (!token) return;

      try {
        const response = await fetch('http://localhost:4000/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query {
                todoLists(userId: "${token.id}") {
                  id
                  title
                }
              }
            `,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setTodoLists(data.data.todoLists);
        } else {
          setError('Échec requête');
        }
      } catch (error) {
        setError(error.message);
      }
    };

    fetchTodoLists();
  }, [token]);

  const addOrRenameTodoList = async () => {
    const titleToUse = renameId ? newTitle : newTodoTitle;

    if (!titleToUse) {
        setError('Champ vide');
        return;
    }

    try {
        const response = await fetch('http://localhost:4000/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    mutation {
                        ${renameId ? `updateTodoList(id: "${renameId}", title: "${newTitle}")` : `createTodoList(userId: "${token.id}", title: "${newTodoTitle}")`} {
                            id
                            title
                        }
                    }
                `,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            setError(data.errors ? data.errors[0].message : 'Échec requête');
            return;
        }

        if (renameId) {
            setTodoLists(todoLists.map(todo => (todo.id === renameId ? { ...todo, title: newTitle } : todo)));
        } else {
            setTodoLists([...todoLists, data.data.createTodoList]);
        }
        setNewTodoTitle('');
        setNewTitle('');
        setRenameId(null);
    } catch (error) {
        setError(error.message);
    }
  };


  const deleteTodoList = async (id) => {
    try {
      const response = await fetch('http://localhost:4000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation {
              deleteTodoList(id: "${id}") {
                id
              }
            }
          `,
        }),
      });

      if (response.ok) {
        setTodoLists(todoLists.filter(todo => todo.id !== id));
      } else {
        setError('Échec requête');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={Style.item}>
      <Text style={Style.itemText}>{item.title}</Text>
      <View style={Style.buttonContainer}>
        <TouchableOpacity style={Style.buttonIcon} onPress={() => navigation.navigate('Details', { todoListId: item.id })}>
          <Image source={require('../assets/eye.png')} style={Style.icon} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={Style.buttonIcon} 
          onPress={() => {
            setRenameId(item.id);
            setNewTitle(item.title);
            setNewTodoTitle('');
          }}
        >
          <Image source={require('../assets/pen.png')} style={Style.icon} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={Style.buttonIcon} 
          onPress={() => deleteTodoList(item.id)}
        >
          <Image source={require('../assets/bin.png')} style={Style.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={Style.main}>
      <Text style={Style.title}>Vos todolists</Text>
      
      <View style={Style.tasksContainer}>
        {todoLists.length > 0 ? (
          <FlatList
            data={todoLists}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        ) : (
          <Text style={Style.linkText}>Aucune todolist disponible.</Text>
        )}
      </View>

      <Text style={Style.title}>{renameId ? 'Renommer todolist' : 'Ajout todolist'}</Text>
      {error ? <Text style={Style.errorText}>{error}</Text> : null}
      <Form 
        newTask={renameId ? newTitle : newTodoTitle} 
        setNewTask={renameId ? setNewTitle : setNewTodoTitle} 
        onPress={addOrRenameTodoList} 
      />
    </View>
  );
};

export default TodoListsScreen;
