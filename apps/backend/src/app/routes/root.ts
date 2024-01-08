import { FastifyInstance } from 'fastify';
import base64url from 'base64url';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function (request, reply) {
    try {
      await request.jwtVerify();
      console.log(request.user.email);
    } catch (err) {
      reply.send(err);
    }
    return {
      message: "Hello, you're authenticated!",
    };
  });

  fastify.get('/profile', async function (request, reply) {
    try {
      await request.jwtVerify();
      const sessionEmail = request.user.email;
      console.log(request.usersDatabase.getUser(sessionEmail));

      return {
        email: sessionEmail,
        authenticators: request.usersDatabase
          .getUser(sessionEmail)
          ?.getAllAuthenticators()
          .map((authenticator) => ({
            credentialID: base64url.encode(
              Buffer.from(authenticator.credentialID)
            ),
          })),
      };
    } catch (err) {
      reply.send(err);
    }
  });
}
