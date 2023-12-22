import { RouteHandlerMethod } from 'fastify';
import { Effect, Either, pipe } from 'effect';
import * as S from '@effect/schema/dist/dts/Schema';
import { CredentialCreationOptionsRequest } from '@passkey-example/api-schema';
import { Authenticator, UsersDatabase } from '../../../plugins/localDatabase';
import { GenerateAuthenticationOptionsOpts } from '@simplewebauthn/server';
import { WebauthnConfigOptions } from '../../../plugins/webauthnConfig';

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
  transports: authenticator.transports,
});

const generateAuthenticationOptions = (
  authenticators: Authenticator[],
  config: WebauthnConfigOptions
): GenerateAuthenticationOptionsOpts => ({
  userVerification: 'preferred',
  rpID: config.rpId,
});

export const authenticateGenerateOptionsHandler =
  (): RouteHandlerMethod => async (request, reply) => {
    const createAuthenticationChallenge = pipe(
      S.parseEither(CredentialCreationOptionsRequest)(request.body),
      Effect.flatMap(checkIfUserExists(request.usersDatabase)),
      Effect.map((user) => user.getAllAuthenticators())
    );
  };
