import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRoute } from '@react-navigation/native';
import TodoList from '../components/TodoList';
import Style from '../Style/Style';
import Form from '../UI/Form';

const TodoListDetailsScreen = () => {
  const route = useRoute();
  const { todoListId } = route.params;
  const [todoList, setTodoList] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [tick, setTick] = useState(false);

  useEffect(() => {
    const fetchTodoListDetails = async () => {
      try {
        const response = await fetch('http://localhost:4000/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetTodoList($id: ID!) {
                todoList(id: $id) {
                  id
                  title
                }
              }
            `,
            variables: { id: todoListId },
          }),
        });
    
        const data = await response.json();
        if (response.ok) {
          setTodoList(data.data.todoList);
        } else {
          setError('Echec requete');
        }
      } catch (error) {
        setError(error.message);
      }
    };
    
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:4000/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              query GetTasks($todoListId: ID!) {
                tasks(todoListId: $todoListId) {
                  id
                  task
                  completed
                }
              }
            `,
            variables: { todoListId },
          }),
        });
    
        const data = await response.json();
        if (response.ok) {
          setTasks(data.data.tasks);
        } else {
          setError(data.errors ? data.errors[0].message : 'Echec requete');
        }
      } catch (error) {
        setError(error.message);
      }
    };
    
    fetchTodoListDetails();
    fetchTasks();
  }, [todoListId]);

  const applyTick = async () => {
    try {
      const updatedTasks = await Promise.all(
        tasks.map(async (task) => {
          const response = await fetch('http://localhost:4000/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `
                mutation UpdateTask($id: ID!, $completed: Boolean!) {
                  updateTask(id: $id, completed: $completed) {
                    id
                    task
                    completed
                  }
                }
              `,
              variables: { id: task.id, completed: !tick },
            }),
          });
  
          const data = await response.json();
          return data.data.updateTask; 
        })
      );
  
      setTasks(updatedTasks);
      setTick(!tick);
  
    } catch (error) {
      setError("Echec requete");
    }
  };
  
  const applyFilter = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'incomplete') return !task.completed;
    return true;
  });

  const updateTodo = async (id, completed) => {
    try {
      const response = await fetch('http://localhost:4000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation UpdateTask($id: ID!, $completed: Boolean!) {
              updateTask(id: $id, completed: $completed) {
                id
                task
                completed
              }
            }
          `,
          variables: { id, completed },
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === id ? { ...task, completed } : task
          )
        );
      } else {
        setError(data.errors ? data.errors[0].message : 'Echec requete');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch('http://localhost:4000/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation DeleteTask($id: ID!) {
              deleteTask(id: $id) {
                id
                task
                completed
              }
            }
          `,
          variables: { id },
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      } else {
        setError(data.errors ? data.errors[0].message : 'Echec requete');
      }
    } catch (error) {
      setError(error.message);
    }
  };
  
  const createTodo = async () => {
    if (!newTask) {
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
            mutation CreateTask($todoListId: ID!, $task: String!) {
              createTask(todoListId: $todoListId, task: $task) {
                id
                task
                completed
              }
            }
          `,
          variables: { todoListId, task: newTask },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setTasks(prevTasks => [...prevTasks, data.data.createTask]);
        setNewTask('');
      } else {
        setError(data.errors ? data.errors[0].message : 'Echec requete');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const ProgressBar = ({ completed, total }) => {
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return (
        <View style={{ marginVertical: 20 }}>
          <Text style={{ color: 'white' }}>
            {completed} / {total} tâches complétées
          </Text>
          <View style={{
            height: 10,
            backgroundColor: '#fff',
            borderRadius: 5,
            overflow: 'hidden',
          }}>
          <View style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: '#93B1A6',
          }} />
          </View>
        </View>
    );
  };

  return (
    <View style={Style.main}>
        {todoList ? (
            <Text style={Style.title}>{todoList.title}</Text>
        ) : (
            <Text style={Style.title}>Chargement...</Text>
        )}

        <ProgressBar
            completed={tasks.filter(task => task.completed).length}
            total={tasks.length}
        />

        <View style={Style.filterContainer}>
            <Pressable onPress={() => applyFilter('all')} style={Style.button}>
                <Text style={Style.buttonText}>toutes</Text>
            </Pressable>
            <Pressable onPress={() => applyFilter('completed')} style={Style.button}>
                <Text style={Style.buttonText}>complètes</Text>
            </Pressable>
            <Pressable onPress={() => applyFilter('incomplete')} style={Style.button}>
                <Text style={Style.buttonText}>non complètes</Text>
            </Pressable>
            <Pressable onPress={applyTick} style={Style.button}>
                <Text style={Style.buttonText}>{tick ? 'décocher' : 'cocher'}</Text>
            </Pressable>
        </View>
        
        <View style={Style.tasksContainer}>
            {tasks.length > 0 ? (
                <TodoList
                    data={filteredTasks}
                    count={filteredTasks.filter(task => task.completed).length}
                    deleteTodo={deleteTodo}
                    updateTodo={updateTodo}
                />
            ) : (
                <Text style={Style.linkText}>Aucune tâche disponible.</Text>
            )}
        </View>

        <Text style={Style.title}>Ajout tâche</Text>
        {error ? <Text style={Style.errorText}>{error}</Text> : null}
        <Form newTask={newTask} setNewTask={setNewTask} onPress={createTodo} />
    </View>
  );

};

export default TodoListDetailsScreen;
