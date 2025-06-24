require('dotenv').config();
const { ApolloServer, gql } = require('apollo-server');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('La clé secrète JWT (JWT_SECRET) n\'est pas définie dans le fichier .env');
}

const pool = new Pool({
  /*
  postgresql LOGS
  user: '22008281',
  host: 'postgresql-etu.unicaen.fr',
  database: '22008281_bd',
  password: 'ubai5iZeDeecheu4',
  port: 5432,
  */
});

const typeDefs = gql`
  type User {
    id: ID!
    login: String!
  }

  type Task {
    id: ID!
    todoListId: ID!
    task: String!
    completed: Boolean!
  }

  type TodoList {
    id: ID!
    title: String!
    userId: ID!
    tasks: [Task]
  }

  type AuthPayload {
    token: String
    user: User
  }

  type Mutation {
    signUp(login: String!, password: String!): AuthPayload
    signIn(login: String!, password: String!): AuthPayload

    createTodoList(userId: ID!, title: String!): TodoList
    deleteTodoList(id: ID!): TodoList
    updateTodoList(id: ID!, title: String!): TodoList

    createTask(todoListId: ID!, task: String!): Task
    deleteTask(id: ID!): Task
    updateTask(id: ID!, completed: Boolean!): Task
  }

  type Query {
    todoLists(userId: ID!): [TodoList]
    tasks(todoListId: ID!): [Task]
    todoList(id: ID!): TodoList
  }
`;

const resolvers = {
  Mutation: {
    async updateTodoList(_, { id, title }) {
      const result = await pool.query(
          'UPDATE todoLists SET title = $1 WHERE id = $2 RETURNING *',
          [title, id]
      );
      
      if (result.rows.length === 0) {
          throw new Error('TodoList non trouvée');
      }
      
      return result.rows[0];
    },
    async signUp(_, { login, password }) {
      try {
        const existingUser = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
        if (existingUser.rows.length > 0) {
          throw new Error('Ce login est déjà utilisé');
        }

        const password_hash = crypto.createHash('sha256').update(password).digest('hex');

        const result = await pool.query(
          'INSERT INTO users (login, password_hash) VALUES ($1, $2) RETURNING *',
          [login, password_hash]
        );
        const user = result.rows[0];
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
        return { token, user };
      } catch (error) {
        throw new Error(error.message);
      }
    },
    async signIn(_, { login, password }) {
      const result = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
      const user = result.rows[0];
      if (!user) {
        throw new Error('Pseudo non trouvé');
      }

      const password_hash = crypto.createHash('sha256').update(password).digest('hex');

      if (password_hash !== user.password_hash) {
        throw new Error('Mot de passe incorrect');
      }
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
      return { token, user };
    },
    async createTodoList(_, { userId, title }) {
      const result = await pool.query(
        'INSERT INTO todoLists (user_id, title) VALUES ($1, $2) RETURNING *',
        [userId, title]
      );
      return result.rows[0];
    },
    async deleteTodoList(_, { id }) {
      const result = await pool.query('DELETE FROM todoLists WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        throw new Error('TodoLIsts pas trouvé');
      }
      return result.rows[0];
    },
    async createTask(_, { todoListId, task }) {
      const result = await pool.query(
        'INSERT INTO todoList (id_todolist, task, completed) VALUES ($1, $2, false) RETURNING *',
        [todoListId, task]
      );
      return result.rows[0];
    },
    async deleteTask(_, { id }) {
      const result = await pool.query('DELETE FROM todoList WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        throw new Error('todoList pas trouvé');
      }
      return result.rows[0];
    },
    async updateTask(_, { id, completed }) {
      const result = await pool.query(
        'UPDATE todoList SET completed = $1 WHERE id = $2 RETURNING *',
        [completed, id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('todoList pas trouvé');
      }
      
      return result.rows[0];
    },    
  },

  Query: {
    async todoLists(_, { userId }) {
      const result = await pool.query('SELECT * FROM todoLists WHERE user_id = $1', [userId]);
      return result.rows;
    },
    async todoList(_, { id }) {
      const result = await pool.query('SELECT * FROM todoLists WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        throw new Error('todoLists pas trouvé');
      }
      const todoList = result.rows[0];
    
      const tasksResult = await pool.query('SELECT * FROM todoList WHERE id_todolist = $1', [id]);
      todoList.tasks = tasksResult.rows;
      return todoList;
    },    
    async tasks(_, { todoListId }) {
      const result = await pool.query('SELECT * FROM todoList WHERE id_todolist = $1', [todoListId]);
      return result.rows;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    return { token: token.replace('Bearer ', '') }; 
  },
});
server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
