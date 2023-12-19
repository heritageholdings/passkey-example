import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';

// using declaration merging, add your plugin props to the appropriate fastify interfaces
// if prop type is defined here, the value will be typechecked when you call decorate{,Request,Reply}
declare module 'fastify' {
  interface FastifyRequest {
    fastify: FastifyInstance;
  }
}

// define plugin using promises
const fastifyPluginAsync: FastifyPluginAsync<FastifyInstance> = async (
  fastify
) => {
  fastify.decorateRequest('fastify', null);
  fastify.addHook('onRequest', async (req) => {
    req.fastify = fastify;
  });
};

// export plugin using fastify-plugin
export default fp(fastifyPluginAsync, '4.x');
