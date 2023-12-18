import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import * as S from '@effect/schema/Schema';
import { exit } from 'process';
import { Effect, Either, Option } from 'effect';

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
  rpOrigins: S.array(S.string).pipe(S.minItems(1)),
  //rpExpectedOrigin: S.string,
  //androidCertFingerprint: S.union(S.string, S.undefined),
});

export interface WebauthnConfigOptions
  extends S.Schema.To<typeof WebauthnConfigOptions> {}

// define plugin using promises
const webauthnConfigPluginAsync: FastifyPluginAsync<
  WebauthnConfigOptions
> = async (fastify) => {
  const rpOrigins = process.env.WEBAUTHN_RPORIGIN?.split(',');
  const androidCertFingerprint = process.env.WEBAUTHN_ANDROID_CERT_FINGERPRINTS;

  const mergedOrigins = [
    ...(rpOrigins ? rpOrigins : []),
    ...(androidCertFingerprint
      ? [`android:apk-key-hash:${androidCertFingerprint}`]
      : []),
  ];

  const config = S.parseEither(WebauthnConfigOptions)({
    rpId: process.env.WEBAUTHN_RPID,
    rpOrigins: mergedOrigins,
    rpName: process.env.WEBAUTHN_RPNAME,
    //androidCertFingerprint: process.env.WEBAUTHN_ANDROID_CERT_FINGERPRINTS,
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
