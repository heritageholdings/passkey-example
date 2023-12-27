import axios, { AxiosRequestConfig } from 'axios';
import { config } from './config';
import { Effect } from 'effect';
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@passkey-example/api-schema';

export type NetworkingError = {
  __tag: 'NetworkingError';
  status?: string;
  message: string;
};

const isAxiosError = (
  e: unknown
): e is { status?: string; message: string } => {
  if (typeof e === 'object' && e !== null && 'message' in e) {
    return 'message' in e;
  }
  return false;
};

export const axiosPost = (
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig<unknown>
) =>
  Effect.tryPromise({
    try: () => axios.post(url, data, config),
    catch: (unknown) => {
      // console.log(JSON.stringify(unknown));
      return isAxiosError(unknown)
        ? {
            _tag: 'NetworkingError',
            status: unknown.status,
            message: unknown.message,
          }
        : {
            _tag: 'NetworkingError',
            message: 'Unexpected network error',
          };
    },
  });

export const axiosGenerateRegistrationOptions = (email: string) => {
  const url = new URL('webauthn/register/generate-options', config.endpoint);
  const data = {
    email,
  };
  return axiosPost(url.href, data);
};

export const axiosVerifyRegistrationOptions = (
  registrationResponse: RegistrationResponseJSON
) => {
  const url = new URL('webauthn/register/verify', config.endpoint);
  return axiosPost(url.href, registrationResponse);
};

export const axiosGenerateAuthenticationOptions = (email: string) => {
  const url = new URL(
    'webauthn/authenticate/generate-options',
    config.endpoint
  );
  const data = {
    email,
  };
  return axiosPost(url.href, data);
};

export const axiosVerifyAuthenticationOptions = (
  authResponse: AuthenticationResponseJSON
) => {
  const url = new URL('webauthn/authenticate/verify', config.endpoint);
  return axiosPost(url.href, authResponse);
};
