import { FastifyInstance } from 'fastify';
import { registerGenerateOptionsHandler } from '../handlers/webauthn/register/generate-options';
import { registerVerifyHandler } from '../handlers/webauthn/register/verify';

export default async (fastify: FastifyInstance) => {
  fastify.post(
    '/webauthn/register/generate-options',
    registerGenerateOptionsHandler()
  );

  fastify.get('/webauthn/register/verify', registerVerifyHandler());

  fastify.get('/webauthn/authenticate/generate-options', async function () {
    return { message: 'authenticate/generate-options' };
  });

  fastify.get('/webauthn/authenticate/verify', async function () {
    return { message: 'authenticate/verify' };
  });
};
