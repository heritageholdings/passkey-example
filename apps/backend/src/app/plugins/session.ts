import { fastifySession } from '@fastify/session';
import { fastifyCookie } from '@fastify/cookie';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

// Extend fastify.session with your custom type.
declare module 'fastify' {
  interface Session {
    user_id: string;
    // other_key: your_prefer_type;
    // id?: number;
  }
}

export default fp(async function (fastify: FastifyInstance) {
  fastify.register(fastifyCookie);
  fastify.register(fastifySession, {
    secret: 'a secret with minimum length of 32 characters',
  });
});
