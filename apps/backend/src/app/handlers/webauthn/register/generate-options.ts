import { RouteHandlerMethod } from 'fastify';
import * as S from '@effect/schema/Schema';
import { CredentialCreationOptionsRequest } from '@passkey-example/api-schema';

export const registerGenerateOptionsHandler =
  (): RouteHandlerMethod => (request, reply) => {
    const res = S.parseEither(CredentialCreationOptionsRequest)(request.body);
    console.log(res);
    return { message: 'register/generate-options' };
  };
