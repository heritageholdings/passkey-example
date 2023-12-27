import { RouteHandlerMethod } from 'fastify';
import { Effect, Either, Exit, pipe } from 'effect';
import * as S from '@effect/schema/Schema';
import { CredentialCreationOptionsRequest } from '@passkey-example/api-schema';
import {
  Authenticator,
  ChallengesDatabase,
  UsersDatabase,
} from '../../../plugins/localDatabase';
import {
  generateAuthenticationOptions,
  GenerateAuthenticationOptionsOpts,
} from '@simplewebauthn/server';
import { WebauthnConfigOptions } from '../../../plugins/webauthnConfig';
import {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server/script/deps';

class UserNotFoundError {
  public readonly _tag = 'UserNotFoundError';
}

const checkIfUserExists =
  (userDatabase: UsersDatabase) => (body: { email: string }) =>
    pipe(
      userDatabase.getUser(body.email),
      Either.fromNullable(() => new UserNotFoundError())
    );

const webauthnAuthenticatorToCredential = (authenticator: Authenticator) => ({
  // id = base64url decode of authenticator.credential_id,
  // which is base64url encoded in the database
  id: authenticator.credentialID,
  type: 'public-key' as const,
  ...(authenticator.transports ? { transports: authenticator.transports } : {}),
});

const prepareAuthenticationOptions =
  (config: WebauthnConfigOptions) =>
  (authenticators: Authenticator[]): GenerateAuthenticationOptionsOpts => ({
    userVerification: 'preferred',
    rpID: config.rpId,
    allowCredentials: authenticators.map(webauthnAuthenticatorToCredential),
  });

const storeAuthenticationChallenge =
  (authenticationChallenges: ChallengesDatabase, email: string) =>
  (options: PublicKeyCredentialRequestOptionsJSON) =>
    authenticationChallenges.addChallenge(email, options.challenge);
export const authenticateGenerateOptionsHandler =
  (): RouteHandlerMethod => async (request, reply) => {
    const createAuthenticationChallenge = pipe(
      // Decode the client received body
      S.parseEither(CredentialCreationOptionsRequest)(request.body),
      Effect.flatMap((parsedOptions) =>
        pipe(
          // Check if the user exists
          checkIfUserExists(request.usersDatabase)(parsedOptions),
          // Get all the user authenticators
          Effect.map((user) => user.getAllAuthenticators()),
          // Prepare the options for the authenticator
          Effect.map(prepareAuthenticationOptions(request.webauthnConfig)),
          Effect.flatMap((options) =>
            pipe(
              // Generate the options using the simplewebauthn library
              Effect.tryPromise(() => generateAuthenticationOptions(options)),
              // Store the challenge in the database to verify it later
              Effect.tap(
                storeAuthenticationChallenge(
                  request.authenticationChallenge,
                  parsedOptions.email
                )
              )
            )
          )
        )
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
