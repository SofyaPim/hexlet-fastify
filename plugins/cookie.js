import fp from 'fastify-plugin';
import cookie from '@fastify/cookie'; //

// Оборачиваем в fastify-plugin, чтобы куки были доступны во всех роутах без инкапсуляции
export default fp(async (fastify, opts) => {
  await fastify.register(cookie);
});
