import { FastifyPluginCallback, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import * as S from '@effect/schema/Schema';
import { exit } from 'process';
import { Either, Exit } from 'effect';

// using declaration merging, add your plugin props to the appropriate fastify interfaces
// if prop type is defined here, the value will be typechecked when you call decorate{,Request,Reply}
declare module 'fastify' {
  interface FastifyRequest {
    webauthnConfig: WebauthnConfigOptions;
  }
}

const WebauthnConfigOptions = S.struct({
  rpId: S.string,
  rpName: S.string,
  rpOrigin: S.string,
  androidCertFingerprint: S.union(S.string, S.undefined),
});

export interface WebauthnConfigOptions
  extends S.Schema.To<typeof WebauthnConfigOptions> {}

// define plugin using promises
const webauthnConfigPluginAsync: FastifyPluginAsync<
  WebauthnConfigOptions
> = async (fastify) => {
  const config = S.parseEither(WebauthnConfigOptions)({
    rpId: process.env.WEBAUTHN_RPID,
    rpOrigin: process.env.WEBAUTHN_RPORIGIN,
    rpName: process.env.WEBAUTHN_RPNAME,
    androidCertFingerprint: process.env.WEBAUTHN_ANDROID_CERT_FINGERPRINTS,
  });
  if (Either.isLeft(config)) {
    console.error(
      'An error occurred while parsing the .env file:\n',
      config.left
    );
    exit(1);
  }
  fastify.decorateRequest('webauthnConfig', config.right);
};

// export plugin using fastify-plugin
export default fp(webauthnConfigPluginAsync, '4.x');
