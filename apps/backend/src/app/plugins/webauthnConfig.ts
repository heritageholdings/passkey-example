import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import * as S from '@effect/schema/Schema';
import { exit } from 'process';
import { Either, Option, pipe } from 'effect';
import base64url from 'base64url';

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
  iosTeamId: S.string,
  androidCertFingerprint: S.optional(S.string),
});

export interface WebauthnConfigOptions
  extends S.Schema.To<typeof WebauthnConfigOptions> {}

// define plugin using promises
const webauthnConfigPluginAsync: FastifyPluginAsync<
  WebauthnConfigOptions
> = async (fastify) => {
  const rpOrigins = process.env.WEBAUTHN_RPORIGIN?.split(',');

  // Convert from hex string to base64url
  const androidCertFingerprint = pipe(
    Option.fromNullable(process.env.WEBAUTHN_ANDROID_CERT_FINGERPRINTS),
    Option.map((fingerprint) => fingerprint.replace(new RegExp(':', 'g'), '')),
    Option.map((fingerprint) => Buffer.from(fingerprint, 'hex')),
    Option.map(base64url.encode),
    Option.getOrUndefined
  );

  console.log(androidCertFingerprint);

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
    iosTeamId: process.env.WEBAUTHN_IOS_TEAM_ID,
    androidCertFingerprint: process.env.WEBAUTHN_ANDROID_CERT_FINGERPRINTS,
  });
  if (Either.isLeft(config)) {
    console.error(
      'An error occurred while parsing the .env file:\n',
      config.left
    );
    exit(1);
  }

  fastify.addHook('onRequest', async (req) => {
    req.webauthnConfig = config.right;
  });
};

// export plugin using fastify-plugin
export default fp(webauthnConfigPluginAsync, '4.x');
