import { Effect, pipe } from 'effect';
import {
  axiosGenerateAuthenticationOptions,
  axiosVerifyAuthenticationOptions,
} from '../networking';
import * as S from '@effect/schema/Schema';
import {
  AuthenticationResponseJSON,
  JwtTokenResponse,
  PublicKeyCredentialRequestOptions,
} from '@passkey-example/api-schema';
import {
  PasskeyAuthenticationRequest,
  PasskeyAuthenticationResult,
} from 'react-native-passkey/lib/typescript/Passkey';
import base64url from 'base64url';
import { Passkey } from 'react-native-passkey';
import { parsePasskeyError } from './errors';

const convertToReactNativePasskeyOptions = (
  options: PublicKeyCredentialRequestOptions
): PasskeyAuthenticationRequest => ({
  ...options,
  challenge: base64url.toBase64(options.challenge),
});

const nativeAuthenticatePasskey = (request: PasskeyAuthenticationRequest) =>
  Effect.tryPromise({
    try: () => Passkey.authenticate(request),
    catch: parsePasskeyError,
  });

const convertToAuthenticationResponseJSON = (
  response: PasskeyAuthenticationResult
): AuthenticationResponseJSON => ({
  ...response,
  id: base64url.fromBase64(response.id),
  rawId: base64url.fromBase64(response.rawId),
  response: {
    clientDataJSON: base64url.fromBase64(response.response.clientDataJSON),
    authenticatorData: base64url.fromBase64(
      response.response.authenticatorData
    ),
    signature: base64url.fromBase64(response.response.signature),
  },
  clientExtensionResults: {},
  type: 'public-key',
});

export const authenticatePasskey = () =>
  pipe(
    axiosGenerateAuthenticationOptions(),
    Effect.map((response) => response.data),
    Effect.flatMap(S.parseEither(PublicKeyCredentialRequestOptions)),
    Effect.map(convertToReactNativePasskeyOptions),
    Effect.flatMap(nativeAuthenticatePasskey),
    Effect.map(convertToAuthenticationResponseJSON),
    Effect.flatMap(axiosVerifyAuthenticationOptions),
    Effect.map((response) => response.data),
    Effect.flatMap(S.parseEither(JwtTokenResponse))
  );
