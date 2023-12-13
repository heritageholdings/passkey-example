import { RouteHandlerMethod } from 'fastify';
import * as S from '@effect/schema/Schema';
import { CredentialCreationOptionsRequest } from '@passkey-example/api-schema';
import { Effect, Either, Option } from 'effect';
import {
  generateRegistrationOptions,
  GenerateRegistrationOptionsOpts,
} from '@simplewebauthn/server';
import { UserDatabase } from '../../../plugins/localDatabase';
import { WebauthnConfigOptions } from '../../../plugins/webauthnConfig';
import * as repl from 'repl';

const checkIfUserExists =
  (userDatabase: UserDatabase) => (body: { email: string }) => {
    return userDatabase.getUser(body.email)
      ? Either.left('User already exists')
      : Either.right(body.email);
  };

const prepareRegistrationOptions =
  (config: WebauthnConfigOptions) =>
  (email: string): GenerateRegistrationOptionsOpts => ({
    rpName: config.rpName,
    rpID: config.rpId,
    userID: email,
    userName: email,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: 'none',
    // Prevent users from re-registering existing authenticators
    // excludeCredentials, TODO: implement
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'required',
    },
    /**
     * Support the two most common algorithms: ES256, and RS256
     */
    supportedAlgorithmIDs: [-7, -257],
  });

export const registerGenerateOptionsHandler =
  (): RouteHandlerMethod => async (request, reply) => {
    const aaa = S.parseEither(CredentialCreationOptionsRequest)(
      request.body
    ).pipe(
      Either.flatMap(checkIfUserExists(request.userDatabase)),
      Either.map(prepareRegistrationOptions(request.webauthnConfig)),
      Effect.flatMap((options) =>
        Effect.tryPromise(() => generateRegistrationOptions(options))
      )
    );

    const res = await Effect.runPromiseExit(aaa);

    request.userDatabase.addUser({
      email: 'asd@asd.it',
    });

    // S.parseEither(CredentialCreationOptionsRequest)(request.body).pipe(
    //   Either.flatMap(checkIfUserExists(request.userDatabase)),
    //   Either.map(prepareRegistrationOptions(request.webauthnConfig)),
    //   Either.flatMap((options) => {
    //     const asd = Effect.runSync(
    //       Effect.tryPromise(() => generateRegistrationOptions(options))
    //     );
    //   })
    // );
    return { message: 'register/generate-options' };
  };
