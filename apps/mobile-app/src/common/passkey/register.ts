import { Effect, pipe } from 'effect';
import {
  axiosGenerateRegistrationOptions,
  requestRegistrationOptions,
} from '../networking';
import * as S from '@effect/schema/Schema';
import { CredentialCreationOptions } from '@passkey-example/api-schema';
import { PasskeyRegistrationRequest } from 'react-native-passkey/lib/typescript/Passkey';
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

export const RegisterPasskey = (email: string) => {
  return pipe(
    requestRegistrationOptions(email),
    Effect.map((response) => response.data),
    Effect.flatMap(S.parseEither(CredentialCreationOptions)),
    Effect.map(convertCredentialCreationOptionsToReactNativePasskeyOptions),
    Effect.flatMap(nativeRegisterPasskey)
  );
};
