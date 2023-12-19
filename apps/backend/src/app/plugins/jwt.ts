import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';

export default fp(async function (fastify: FastifyInstance) {
  fastify.register(fastifyJwt, {
    secret: 'com.passkey.example.superSecret',
  });
});
