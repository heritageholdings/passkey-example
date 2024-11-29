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
  Passkey,
  PasskeyGetRequest,
  PasskeyGetResult,
} from 'react-native-passkey';
import { parsePasskeyError } from './errors';

const nativeAuthenticatePasskey = (request: PasskeyGetRequest) =>
  Effect.tryPromise({
    try: () => Passkey.get(request),
    catch: parsePasskeyError,
  });

const convertToAuthenticationResponseJSON = (
  response: PasskeyGetResult
): AuthenticationResponseJSON => ({
  ...response,
  clientExtensionResults: {},
  type: 'public-key',
});

export const authenticatePasskey = () =>
  pipe(
    axiosGenerateAuthenticationOptions(),
    Effect.map((response) => response.data),
    Effect.flatMap(S.parseEither(PublicKeyCredentialRequestOptions)),
    Effect.flatMap(nativeAuthenticatePasskey),
    Effect.map(convertToAuthenticationResponseJSON),
    Effect.flatMap(axiosVerifyAuthenticationOptions),
    Effect.map((response) => response.data),
    Effect.flatMap(S.parseEither(JwtTokenResponse))
  );
