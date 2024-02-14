import { FastifyReply, RouteHandlerMethod } from 'fastify';
import * as S from '@effect/schema/Schema';
import { CredentialCreationOptionsRequest } from '@passkey-example/api-schema';
import { Cause, Effect, Either, Exit, pipe } from 'effect';
import {
  generateRegistrationOptions,
  GenerateRegistrationOptionsOpts,
} from '@simplewebauthn/server';
import { WebauthnConfigOptions } from '../../../plugins/webauthnConfig';
import { UsersDatabase } from '../../../plugins/localDatabase';
import { ParseError } from '@effect/schema/ParseResult';

class UserAlreadyExistsError {
  public readonly _tag = 'UserAlreadyExistsError';
}

const checkIfUserExists =
  (userDatabase: UsersDatabase) => (body: { email: string }) => {
    return userDatabase.getUser(body.email)
      ? Either.left(new UserAlreadyExistsError())
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
    // Prevent users from re-registering existing authenticators (in this example we allow the user to register only one authenticator so we don't provide the list of the existing ones)
    // excludeCredentials,
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'required',
    },
    /**
     * Support the two most common algorithms: ES256, and RS256
     */
    supportedAlgorithmIDs: [-7, -257],
  });

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
          // Store the challenge in the session to verify it later
          Effect.tap((options) =>
            request.session.set('registrationChallenge', options.challenge)
          )
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
