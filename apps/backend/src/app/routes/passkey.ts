import { FastifyInstance } from 'fastify';
import { registerGenerateOptionsHandler } from '../handlers/webauthn/register/generate-options';
import { registerVerifyHandler } from '../handlers/webauthn/register/verify';
import { authenticateGenerateOptionsHandler } from '../handlers/webauthn/authenticate/generate-options';

export default async (fastify: FastifyInstance) => {
  fastify.post(
    '/webauthn/register/generate-options',
    registerGenerateOptionsHandler()
  );

  fastify.post('/webauthn/register/verify', registerVerifyHandler());

  fastify.post(
    '/webauthn/authenticate/generate-options',
    authenticateGenerateOptionsHandler()
  );

  fastify.get(
    '/webauthn/authenticate/verify',
    authenticateGenerateOptionsHandler()
  );

  fastify.get('/.well-known/apple-app-site-association', async (request) => {
    return {
      applinks: {},
      webcredentials: {
        apps: [`${request.webauthnConfig.iosTeamId}.com.passkey.example`],
      },
      appclips: {},
    };
  });
};
