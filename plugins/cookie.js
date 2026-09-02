// @ts-check
import fp from "fastify-plugin";
import flash from "@fastify/flash";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";

// Оборачиваем в fastify-plugin, чтобы сессии и куки пробросились глобально во все роуты
export default fp(async (app, _options) => {
  // 1. Сначала куки
  await app.register(fastifyCookie);

  // 2. Сразу после этого сессии
  await app.register(fastifySession, {
    // Секретный ключ должен быть длинным (минимум 32 символа)
    secret: "a-secret-with-minimum-length-of-32-characters",
    // secure: false нужен для локальной разработки (http), на продакшене (https) ставят true
    cookie: { secure: false },
  });
  await app.register(flash);
});
