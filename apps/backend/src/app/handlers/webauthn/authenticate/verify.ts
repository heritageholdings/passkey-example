import { RouteHandlerMethod } from 'fastify';
import { Effect, Either, Exit, pipe } from 'effect';
import * as S from '@effect/schema/Schema';
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@passkey-example/api-schema';
import {
  Authenticator,
  ChallengesDatabase,
} from '../../../plugins/localDatabase';
import { InvalidChallengeError, VerificationFailedError } from '../errors';
import {
  verifyAuthenticationResponse,
  VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';
import { WebauthnConfigOptions } from '../../../plugins/webauthnConfig';
import { verifyRegistrationResponse } from '@simplewebauthn/server/esm';

const getExpectedChallenge =
  (challengeDatabase: ChallengesDatabase) =>
  ({
    authenticationResponse,
  }: {
    authenticationResponse: AuthenticationResponseJSON;
  }) =>
    Either.fromNullable(
      challengeDatabase.getChallenge(authenticationResponse.email),
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
      Effect.bind(
        'expectedChallenge',
        getExpectedChallenge(request.authenticationChallenge)
      ),
      Effect.tap(({ authenticationResponse }) =>
        request.authenticationChallenge.removeChallenge(
          authenticationResponse.email
        )
      ),
      Effect.bind('authenticator', ({ authenticationResponse }) =>
        Effect.fromNullable(
          request.usersDatabase
            .getUser(authenticationResponse.email)
            ?.getAuthenticator(authenticationResponse.rawId)
        )
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
        ({
          verifyAuthenticationResponseOpts,
          authenticationResponse,
          authenticator,
        }) =>
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
              request.usersDatabase
                .getUser(authenticationResponse.email)
                ?.updateAuthenticator(credentialID, {
                  ...authenticator,
                  counter: newCounter,
                })
            ),
            // sign a JWT token as a response
            Effect.map(() =>
              request.fastify.jwt.sign({
                email: authenticationResponse.email,
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
