import { RouteHandlerMethod } from 'fastify';
import { Effect, Exit, pipe } from 'effect';
import {
  generateAuthenticationOptions,
  GenerateAuthenticationOptionsOpts,
} from '@simplewebauthn/server';
import { WebauthnConfigOptions } from '../../../plugins/webauthnConfig';

const prepareAuthenticationOptions = (
  config: WebauthnConfigOptions
): GenerateAuthenticationOptionsOpts => ({
  userVerification: 'preferred',
  rpID: config.rpId,
  allowCredentials: [],
});
export const authenticateGenerateOptionsHandler =
  (): RouteHandlerMethod => async (request, reply) => {
    const createAuthenticationChallenge = pipe(
      // Generate the options to send to the client
      Effect.tryPromise(() =>
        pipe(
          prepareAuthenticationOptions(request.webauthnConfig),
          generateAuthenticationOptions
        )
      ),
      // Store the challenge in the database to verify it later
      Effect.tap((options) =>
        request.session.set('authenticationChallenge', options.challenge)
      )
    );

    const operationResults = await Effect.runPromiseExit(
      createAuthenticationChallenge
    );

    Exit.match(operationResults, {
      onFailure: (cause) => {
        console.error(cause);
        reply.status(500).send({ message: 'Internal server error' });
      },
      onSuccess: (credentialRequestOptions) =>
        // Send the options to the client
        reply.send(credentialRequestOptions),
    });
  };
