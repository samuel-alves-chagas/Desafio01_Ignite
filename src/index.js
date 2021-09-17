const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

const checkTaskExists = (request, response, next) => {
  const { user } = request;
  const { id } = request.params;

  const task = user.todos.find((task) => task.id === id);

  if (!task) {
    return response.status(404).json({ error: "Task doesn't exists" });
  }

  request.task = task;

  return next();
};

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const task = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(task);

  return response.status(201).json(task);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checkTaskExists,
  (request, response) => {
    const { title, deadline } = request.body;
    const { task } = request;

    task.title = title;
    task.deadline = deadline;

    return response.status(201).json(task);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checkTaskExists,
  (request, response) => {
    const { task } = request;

    task.done = true;
    return response.status(201).json(task);
  }
);

app.delete(
  "/todos/:id",
  checksExistsUserAccount,
  checkTaskExists,
  (request, response) => {
    const { task, user } = request;
    taskIndex = user.todos.findIndex((candidate) => candidate.id === task.id);
    user.todos.splice(taskIndex, 1);
    return response.status(204).send();
  }
);

module.exports = app;
