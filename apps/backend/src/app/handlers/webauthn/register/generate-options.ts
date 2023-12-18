import { FastifyReply, RouteHandlerMethod } from 'fastify';
import * as S from '@effect/schema/Schema';
import {
  CredentialCreationOptionsRequest,
  RegistrationResponseJSON,
} from '@passkey-example/api-schema';
import { Cause, Effect, Either, Exit, pipe } from 'effect';
import {
  generateRegistrationOptions,
  GenerateRegistrationOptionsOpts,
} from '@simplewebauthn/server';
import { WebauthnConfigOptions } from '../../../plugins/webauthnConfig';
import {
  ChallengesDatabase,
  UsersDatabase,
} from '../../../plugins/localDatabase';
import { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/server/script/deps';
import { ParseError } from '@effect/schema/dist/dts/ParseResult';

type UserAlreadyExistsError = {
  _tag: 'UserAlreadyExistsError';
};

const checkIfUserExists =
  (userDatabase: UsersDatabase) => (body: { email: string }) => {
    return userDatabase.getUser(body.email)
      ? Either.left<UserAlreadyExistsError>({ _tag: 'UserAlreadyExistsError' })
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

const storeRegistrationChallenge =
  (registrationChallenge: ChallengesDatabase) =>
  (options: PublicKeyCredentialCreationOptionsJSON) => {
    registrationChallenge.addChallenge(options.user.id, options.challenge);
    return options;
  };

const handleErrors =
  (reply: FastifyReply) =>
  (
    cause: Cause.Cause<
      UserAlreadyExistsError | ParseError | Cause.UnknownException
    >
  ) => {
    console.error(`Failed to generate registration challenge: ${cause}`);

    if (cause._tag === 'Fail') {
      if (cause.error._tag === 'UserAlreadyExistsError') {
        reply.status(409).send({ message: 'User already exists' });
      } else if (cause.error._tag === 'ParseError') {
        reply.status(400).send({ message: 'Invalid request' });
      }
    } else {
      reply.status(500).send({ message: 'Internal server error' });
    }
  };

export const registerGenerateOptionsHandler =
  (): RouteHandlerMethod => async (request, reply) => {
    const createNewRegistrationChallenge = pipe(
      S.parseEither(CredentialCreationOptionsRequest)(request.body),
      Either.flatMap(checkIfUserExists(request.usersDatabase)),
      Either.map(prepareRegistrationOptions(request.webauthnConfig)),
      Effect.flatMap((options) =>
        pipe(
          Effect.tryPromise(() => generateRegistrationOptions(options)),
          Effect.tap(storeRegistrationChallenge(request.registrationChallenge))
        )
      )
    );

    const operationResults = await Effect.runPromiseExit(
      createNewRegistrationChallenge
    );

    Exit.match(operationResults, {
      onFailure: handleErrors(reply),
      onSuccess: (credentialCreationOptions) =>
        reply.send(credentialCreationOptions),
    });
  };
