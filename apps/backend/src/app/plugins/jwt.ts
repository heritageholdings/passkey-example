import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { email: string };
    user: {
      email: string;
    };
  }
}

export default fp(async function (fastify: FastifyInstance) {
  fastify.register(fastifyJwt, {
    secret: 'com.passkey.example.superSecret',
    sign: {
      expiresIn: '10m',
    },
  });
});
