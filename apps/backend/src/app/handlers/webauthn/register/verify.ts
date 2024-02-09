import { RouteHandlerMethod } from 'fastify';
import { Effect, Either, Exit, pipe } from 'effect';
import * as S from '@effect/schema/Schema';
import { RegistrationResponseJSON } from '@passkey-example/api-schema';
import { User, UsersDatabase } from '../../../plugins/localDatabase';
import {
  VerifiedRegistrationResponse,
  verifyRegistrationResponse,
  VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server';
import { WebauthnConfigOptions } from '../../../plugins/webauthnConfig';
import { InvalidChallengeError, VerificationFailedError } from '../errors';
import { FastifySessionObject } from '@fastify/session';

const getExpectedChallenge = (session: FastifySessionObject) => () =>
  Either.fromNullable(
    session.get('registrationChallenge'),
    () => new InvalidChallengeError()
  );
const prepareVerifyRegistrationResponse = (
  registrationResponse: RegistrationResponseJSON,
  config: WebauthnConfigOptions,
  challenge: NonNullable<string | Uint8Array | undefined>
): VerifyRegistrationResponseOpts => ({
  response: registrationResponse,
  expectedChallenge: `${challenge}`,
  expectedOrigin: [...config.rpOrigins],
  expectedRPID: config.rpId,
  requireUserVerification: true,
});

const registerNewAuthenticator = (
  registrationResponse: RegistrationResponseJSON,
  registrationInfo: NonNullable<
    VerifiedRegistrationResponse['registrationInfo']
  >,
  usersDatabase: UsersDatabase
) => {
  const { email } = registrationResponse;
  const authenticator = {
    ...registrationInfo,
    transports: registrationResponse.response.transports ?? [],
  };

  const user = usersDatabase.getUser(email);
  if (user) {
    user.addAuthenticator(authenticator);
  } else {
    const newUser = new User(email);
    newUser.addAuthenticator(authenticator);
    usersDatabase.addUser(newUser);
  }
};

export const registerVerifyHandler =
  (): RouteHandlerMethod => async (request, reply) => {
    const verifyRegistration = Effect.Do.pipe(
      // Verify the shape of the incoming payload
      Effect.bind('registrationResponse', () =>
        S.parseEither(RegistrationResponseJSON)(request.body)
      ),
      // retrieve the expected challenge from the database
      Effect.bind('expectedChallenge', getExpectedChallenge(request.session)),
      // Remove the challenge from the database
      Effect.tap(() => request.session.set('registrationChallenge', undefined)),
      // prepare the options args for the verification function
      Effect.bind(
        'verifyRegistrationResponseOpts',
        ({ registrationResponse, expectedChallenge }) =>
          Effect.succeed(
            prepareVerifyRegistrationResponse(
              registrationResponse,
              request.webauthnConfig,
              expectedChallenge
            )
          )
      ),
      Effect.flatMap(
        ({ registrationResponse, verifyRegistrationResponseOpts }) =>
          pipe(
            // verify the registration response with the simplewebauthn library
            Effect.tryPromise(() =>
              verifyRegistrationResponse(verifyRegistrationResponseOpts)
            ),
            // check if the verification was successful
            Effect.flatMap((result) =>
              result.verified && result.registrationInfo
                ? Effect.succeed(result.registrationInfo)
                : Effect.fail(new VerificationFailedError())
            ),
            // register the new authenticator
            Effect.tap((registrationInfo) =>
              registerNewAuthenticator(
                registrationResponse,
                registrationInfo,
                request.usersDatabase
              )
            ),
            // sign a JWT token as a response
            Effect.map(() =>
              request.fastify.jwt.sign({
                email: registrationResponse.email,
              })
            )
          )
      )
    );

    const operationResults = await Effect.runPromiseExit(verifyRegistration);
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
