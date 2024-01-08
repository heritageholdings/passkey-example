import { Effect, pipe } from 'effect';
import {
  axiosGenerateRegistrationOptions,
  axiosVerifyRegistrationOptions,
} from '../networking';
import * as S from '@effect/schema/Schema';
import {
  CredentialCreationOptions,
  JwtTokenResponse,
  RegistrationResponseJSON,
} from '@passkey-example/api-schema';
import {
  PasskeyRegistrationRequest,
  PasskeyRegistrationResult,
} from 'react-native-passkey/lib/typescript/Passkey';
import base64url from 'base64url';
import { Passkey } from 'react-native-passkey';
import { parsePasskeyError } from './errors';

const convertCredentialCreationOptionsToReactNativePasskeyOptions = (
  options: CredentialCreationOptions
): PasskeyRegistrationRequest => ({
  ...options,
  challenge: base64url.toBase64(options.challenge),
});

const nativeRegisterPasskey = (request: PasskeyRegistrationRequest) =>
  Effect.tryPromise({
    try: () => Passkey.register(request),
    catch: parsePasskeyError,
  });

const convertToRegistrationResponse =
  (email: string) =>
  (result: PasskeyRegistrationResult): RegistrationResponseJSON => ({
    ...result,
    id: base64url.fromBase64(result.id),
    rawId: base64url.fromBase64(result.rawId),
    response: {
      ...result.response,
      attestationObject: base64url.fromBase64(
        result.response.attestationObject
      ),
      clientDataJSON: base64url.fromBase64(result.response.clientDataJSON),
    },
    clientExtensionResults: {},
    type: 'public-key',
    email,
  });

export const registerPasskey = (email: string) => {
  return pipe(
    email,
    axiosGenerateRegistrationOptions,
    Effect.map((response) => response.data),
    Effect.flatMap(S.parseEither(CredentialCreationOptions)),
    Effect.map(convertCredentialCreationOptionsToReactNativePasskeyOptions),
    Effect.flatMap(nativeRegisterPasskey),
    Effect.map(convertToRegistrationResponse(email)),
    Effect.flatMap(axiosVerifyRegistrationOptions),
    Effect.map((response) => response.data),
    Effect.flatMap(S.parseEither(JwtTokenResponse))
  );
};
