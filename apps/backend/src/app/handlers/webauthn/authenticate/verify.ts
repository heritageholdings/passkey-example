import { RouteHandlerMethod } from 'fastify';
import { Effect, Either, Exit, pipe } from 'effect';
import * as S from '@effect/schema/Schema';
import { AuthenticationResponseJSON } from '@passkey-example/api-schema';
import { Authenticator } from '../../../plugins/localDatabase';
import { InvalidChallengeError, VerificationFailedError } from '../errors';
import {
  verifyAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';
import { WebauthnConfigOptions } from '../../../plugins/webauthnConfig';
import { FastifySessionObject } from '@fastify/session';

const getExpectedChallenge = (session: FastifySessionObject) => () =>
  Either.fromNullable(
    session.get('authenticationChallenge'),
    () => new InvalidChallengeError()
  );

const prepareVerifyAuthenticationResponse = (
  authenticationResponse: AuthenticationResponseJSON,
  config: WebauthnConfigOptions,
  challenge: NonNullable<string | Uint8Array | undefined>,
  authenticator: Authenticator
): VerifyAuthenticationResponseOpts => ({
  response: authenticationResponse,
  expectedChallenge: `${challenge}`,
  expectedOrigin: [...config.rpOrigins],
  expectedRPID: config.rpId,
  authenticator: authenticator,
  requireUserVerification: true,
});

export const authenticateVerifyHandler =
  (): RouteHandlerMethod => async (request, reply) => {
    const verifyAuthentication = Effect.Do.pipe(
      Effect.bind('authenticationResponse', () =>
        S.parseEither(AuthenticationResponseJSON)(request.body)
      ),
      Effect.bind('expectedChallenge', getExpectedChallenge(request.session)),
      Effect.tap(() =>
        request.session.set('authenticationChallenge', undefined)
      ),
      Effect.bind('user', ({ authenticationResponse }) =>
        Effect.fromNullable(
          request.usersDatabase.getUserByAuthenticatorId(
            authenticationResponse.rawId
          )
        )
      ),
      Effect.bind('authenticator', ({ user, authenticationResponse }) =>
        Effect.fromNullable(user.getAuthenticator(authenticationResponse.rawId))
      ),
      Effect.bind(
        'verifyAuthenticationResponseOpts',
        ({ authenticationResponse, expectedChallenge, authenticator }) =>
          Effect.succeed(
            prepareVerifyAuthenticationResponse(
              authenticationResponse,
              request.webauthnConfig,
              expectedChallenge,
              authenticator
            )
          )
      ),
      Effect.flatMap(
        ({ verifyAuthenticationResponseOpts, authenticator, user }) =>
          pipe(
            Effect.tryPromise(() =>
              verifyAuthenticationResponse(verifyAuthenticationResponseOpts)
            ),
            Effect.flatMap((result) =>
              result.verified && result.authenticationInfo
                ? Effect.succeed(result.authenticationInfo)
                : Effect.fail(new VerificationFailedError())
            ),
            // Update the counter in the database
            Effect.tap(({ credentialID, newCounter }) =>
              user.updateAuthenticator(credentialID, {
                ...authenticator,
                counter: newCounter,
              })
            ),
            // sign a JWT token as a response
            Effect.map(() =>
              request.fastify.jwt.sign({
                email: user.email,
              })
            )
          )
      )
    );

    const operationResults = await Effect.runPromiseExit(verifyAuthentication);
    Exit.match(operationResults, {
      onFailure: (error) => {
        console.log(error);
        reply.status(500).send({ message: 'Internal server error' });
      },
      onSuccess: (token) => {
        reply.send({ token });
      },
    });
  };
