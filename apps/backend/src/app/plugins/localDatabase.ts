import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { VerifiedRegistrationResponse } from '@simplewebauthn/server';
import base64url from 'base64url';
import { AuthenticatorTransportFuture } from '@simplewebauthn/typescript-types';

// using declaration merging, add your plugin props to the appropriate fastify interfaces
// if prop type is defined here, the value will be typechecked when you call decorate{,Request,Reply}
declare module 'fastify' {
  interface FastifyRequest {
    usersDatabase: UsersDatabase;
  }
}

export type Authenticator = NonNullable<
  VerifiedRegistrationResponse['registrationInfo']
> & {
  transports?: AuthenticatorTransportFuture[];
};

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

  public updateAuthenticator(
    credentialID: Uint8Array,
    authenticator: Authenticator
  ): void {
    const credentialIdBase64url = base64url.encode(Buffer.from(credentialID));
    this.authenticators.set(credentialIdBase64url, authenticator);
  }

  public getAllAuthenticators(): Authenticator[] {
    return Array.from(this.authenticators.values());
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

  public getUserByAuthenticatorId(credentialId: string): User | undefined {
    for (const user of this.users.values()) {
      const maybeAuthenticator = user.getAuthenticator(credentialId);
      if (maybeAuthenticator) {
        return user;
      }
    }
    return undefined;
  }
}

// define plugin using promises
const webauthnConfigPluginAsync: FastifyPluginAsync<UsersDatabase> = async (
  fastify
) => {
  const usersDatabase = new UsersDatabase();

  fastify.addHook('onRequest', async (req) => {
    req.usersDatabase = usersDatabase;
  });
};

// export plugin using fastify-plugin
export default fp(webauthnConfigPluginAsync, '4.x');
