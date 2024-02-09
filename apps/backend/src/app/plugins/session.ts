import { fastifySession } from '@fastify/session';
import { fastifyCookie } from '@fastify/cookie';
import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

// Extend fastify.session with your custom type.
declare module 'fastify' {
  interface Session {
    registrationChallenge?: string;
    authenticationChallenge?: string;
  }
}

export default fp(async function (fastify: FastifyInstance) {
  fastify.register(fastifyCookie);
  fastify.register(fastifySession, {
    secret: 'a secret with minimum length of 32 characters',
  });
});
