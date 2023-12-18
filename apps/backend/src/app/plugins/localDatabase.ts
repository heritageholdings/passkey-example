import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { VerifiedRegistrationResponse } from '@simplewebauthn/server';
import base64url from 'base64url';

// using declaration merging, add your plugin props to the appropriate fastify interfaces
// if prop type is defined here, the value will be typechecked when you call decorate{,Request,Reply}
declare module 'fastify' {
  interface FastifyRequest {
    usersDatabase: UsersDatabase;
    registrationChallenge: ChallengesDatabase;
    authenticationChallenge: ChallengesDatabase;
  }
}

type Authenticator = NonNullable<
  VerifiedRegistrationResponse['registrationInfo']
>;

export class User {
  public readonly email: string;
  private authenticators: Map<string, Authenticator>;

  constructor(email: string) {
    this.email = email;
    this.authenticators = new Map();
  }

  public addAuthenticator(authenticator: Authenticator): void {
    const credentialIdBase64url = base64url.encode(
      Buffer.from(authenticator.credentialID)
    );
    this.authenticators.set(credentialIdBase64url, authenticator);
  }

  public getAuthenticator(rawId: string): Authenticator | undefined {
    return this.authenticators.get(rawId);
  }
}

export class UsersDatabase {
  private users: Map<string, User> = new Map();

  public getUser(email: string): User | undefined {
    return this.users.get(email);
  }

  public addUser(user: User): void {
    this.users.set(user.email, user);
  }
}

export class ChallengesDatabase {
  private challenges: Map<string, string | Uint8Array> = new Map();

  public getChallenge(email: string): string | Uint8Array | undefined {
    return this.challenges.get(email);
  }

  public addChallenge(email: string, challenge: string | Uint8Array): void {
    this.challenges.set(email, challenge);
  }
  public removeChallenge(email: string): void {
    this.challenges.delete(email);
  }
}

// define plugin using promises
const webauthnConfigPluginAsync: FastifyPluginAsync<UsersDatabase> = async (
  fastify
) => {
  fastify.decorateRequest('usersDatabase', new UsersDatabase());
  fastify.decorateRequest('registrationChallenge', new ChallengesDatabase());
  fastify.decorateRequest('authenticationChallenge', new ChallengesDatabase());
};

// export plugin using fastify-plugin
export default fp(webauthnConfigPluginAsync, '4.x');
