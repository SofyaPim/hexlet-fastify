// src/plugins/repository.js
import fp from 'fastify-plugin';

let usersCollection = [
  { id: 1, username: "Sheldon", email: "sheldon@caltech.edu", password: "bazinga" },
  { id: 2, username: "Leonard", email: "leonard@caltech.edu", password: "password123" },
  { id: 3, username: "Penny", email: "penny@cheesecake.com", password: "knock_knock_knock" },
  { id: 4, username: "Howard", email: "wolowitz@caltech.edu", password: "space_cowboy" },
  { id: 5, username: "Raj", email: "raj@caltech.edu", password: "cinnamon" }
];
let nextId = 6;

const usersRepository = {
  get: () => usersCollection,
  find: (id) => usersCollection.find((user) => String(user.id) === String(id)),
  save: (user) => {
    user.id = nextId++;
    usersCollection.push(user);
    return user;
  },
};

export default fp(async function (fastify, _opts) {
  // Вешаем репозиторий на глобальный объект фреймворка
  fastify.decorate("usersRepository", usersRepository);
});
