import { RouteHandlerMethod } from 'fastify';
import { Either, pipe, Option, Effect } from 'effect';
import * as S from '@effect/schema/Schema';
import { RegistrationResponseJSON } from '@passkey-example/api-schema';
import { ChallengesDatabase, User } from '../../../plugins/localDatabase';
import { either } from '@effect/schema/Schema';
import {
  verifyRegistrationResponse,
  VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server';
import { WebauthnConfigOptions } from '../../../plugins/webauthnConfig';
import base64url from 'base64url';

type InvalidChallengeError = {
  _tag: 'UserAlreadyExistsError';
};

// const verifyRegistrationChallenge =
//   (registrationChallenge: ChallengesDatabase) =>
//   (registrationResponse: RegistrationResponseJSON) => {
//     const asd = Option.fromNullable(
//       registrationChallenge.getChallenge(registrationResponse.id)
//     ).pipe(Either.fromOption(() => ({ _tag: 'InvalidChallengeError' })),
//         Either.flatMap(challenge => {
//             challenge !== registrationResponse.
//         });
//
//     const challenge = registrationChallenge.getChallenge(
//       registrationResponse.rawId
//     );
//
//     if (!challenge) {
//       console.error(
//         `Failed to verify registration: challenge not found for ${registrationResponse.rawId}`
//       );
//       return registrationResponse;
//     }
//   };

const prepareVerifyRegistrationResponse = (
  registrationResponse: RegistrationResponseJSON,
  config: WebauthnConfigOptions,
  challenge: NonNullable<string | Uint8Array | undefined>
): VerifyRegistrationResponseOpts => ({
  response: {
    ...registrationResponse,
    response: {
      ...registrationResponse.response,
      transports: [...registrationResponse.response.transports],
    },
  },
  expectedChallenge: `${challenge}`,
  expectedOrigin: [...config.rpOrigins],
  expectedRPID: config.rpId,
  requireUserVerification: true,
});

export const registerVerifyHandler =
  (): RouteHandlerMethod => async (request, reply) => {
    const verifyRegistration = Effect.Do.pipe(
      Effect.bind('registrationResponse', () =>
        S.parseEither(RegistrationResponseJSON)(request.body)
      ),
      Effect.bind('expectedChallenge', ({ registrationResponse }) =>
        Option.fromNullable(
          request.registrationChallenge.getChallenge(registrationResponse.id)
        )
      ),
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
      )
    ).pipe(
      Effect.flatMap(
        ({ registrationResponse, verifyRegistrationResponseOpts }) =>
          pipe(
            Effect.tryPromise(() =>
              verifyRegistrationResponse(verifyRegistrationResponseOpts)
            ),
            Effect.map((result) => {
              if (result.verified && result.registrationInfo) {
                const userId = registrationResponse.id;
                const user = request.usersDatabase.getUser(userId);
                if (user) {
                  user.addAuthenticator(result.registrationInfo);
                } else {
                  const newUser = new User(registrationResponse.id);
                  newUser.addAuthenticator(result.registrationInfo);
                  request.usersDatabase.addUser(newUser);
                }
                request.registrationChallenge.removeChallenge(userId);
              }
              result.registrationInfo;
              console.log('result', result);
              return result;
            })
          )
      )
    );
  };
