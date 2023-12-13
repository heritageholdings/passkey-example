import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';

// using declaration merging, add your plugin props to the appropriate fastify interfaces
// if prop type is defined here, the value will be typechecked when you call decorate{,Request,Reply}
declare module 'fastify' {
  interface FastifyRequest {
    userDatabase: UserDatabase;
  }
}

type User = {
  email: string;
  // credentials: PublicKeyCredentialDescriptorFuture[] | undefined;
};

export class UserDatabase {
  private users: Map<string, User> = new Map();

  public getUser(email: string): User | undefined {
    return this.users.get(email);
  }

  public addUser(user: User): void {
    this.users.set(user.email, user);
  }
}

// define plugin using promises
const webauthnConfigPluginAsync: FastifyPluginAsync<UserDatabase> = async (
  fastify
) => {
  fastify.decorateRequest('userDatabase', new UserDatabase());
};

// export plugin using fastify-plugin
export default fp(webauthnConfigPluginAsync, '4.x');
