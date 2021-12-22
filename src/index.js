

// const { v4: uuidv4 } = require('uuid');
const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const { username } = req.headers;
  const user = users.find(u => u.username === username);

  if(!user) {
    return res.status(400).json({ error: "User not found" });
  };

  req.user = user; 
  return next();
};

app.post('/users', (req, res) => {
  const { name, username } = req.body;

  if(users.some(u => u.username === username)){
    return res.status(400).json({ error: "User already exists" });
  };

  const user = {
    id: uuid(),
    name,
    username,
    todos: []
  };

  users.push(user);
  return res.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const { user } = req;  
  return res.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { user } = req;

  const todo = {
    id: uuid(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false,
  };

  user?.todos.push(todo);
  return res.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { title, deadline } = req.body;
  const { user } = req;
  const { id } = req.params;

  const index = user.todos.findIndex(t => t.id === id);
  const userIndex = users.findIndex(u => u.id === user.id);

  if(index === -1 || userIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  }

  user.todos[index] = {
    ...user.todos[0],
    title,
    deadline
  };
  users[userIndex] = user;

  return res.json(user.todos[index]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const index = user.todos.findIndex(t => t.id === id);
  const userIndex = users.findIndex(u => u.id === user.id);

  if(index === -1 || userIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  };

  user.todos[index].done = true;
  users[userIndex] = user;

  return res.json(user.todos[index]);
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const index = user.todos.findIndex(t => t.id === id);
  const userIndex = users.findIndex(u => u.id === user.id);

  if(index === -1 || userIndex === -1) {
    return res.status(404).json({ error: "Todo not found" });
  };

  user.todos.splice(index, 1);
  users[userIndex] = user;

  return res.status(204).json();
});

module.exports = app;