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
import base64url from 'base64url';
import {
  Passkey,
  PasskeyCreateRequest,
  PasskeyCreateResult,
} from 'react-native-passkey';
import { parsePasskeyError } from './errors';

const nativeRegisterPasskey = (request: PasskeyCreateRequest) =>
  Effect.tryPromise({
    try: () => Passkey.create(request),
    catch: parsePasskeyError,
  });

const convertToRegistrationResponse =
  (email: string) =>
  (result: PasskeyCreateResult): RegistrationResponseJSON => ({
    ...result,
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
    Effect.flatMap(nativeRegisterPasskey),
    Effect.map(convertToRegistrationResponse(email)),
    Effect.flatMap(axiosVerifyRegistrationOptions),
    Effect.map((response) => response.data),
    Effect.flatMap(S.parseEither(JwtTokenResponse))
  );
};
