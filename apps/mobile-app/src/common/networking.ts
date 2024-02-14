import axios, { AxiosRequestConfig } from 'axios';
import { config } from './config';
import { Effect } from 'effect';
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@passkey-example/api-schema';

export class NetworkingError {
  public readonly _tag = 'NetworkingError';
  public readonly status: number | undefined;
  public readonly message: string;
  constructor(message: string, status: number | undefined = undefined) {
    this.message = message;
    this.status = status;
  }
}

const client = axios.create({
  baseURL: config.endpoint,
});

const isAxiosError = (
  e: unknown
): e is { response: { status: number }; message: string } => {
  return (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    'response' in e &&
    typeof e.response === 'object' &&
    e.response !== null &&
    'status' in e.response &&
    typeof e.response.status === 'number'
  );
};

export const axiosPost = (
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig<unknown>
) =>
  Effect.tryPromise({
    try: () => client.post(url, data, config),
    catch: (unknown) => {
      return isAxiosError(unknown)
        ? new NetworkingError(unknown.message, unknown.response.status)
        : new NetworkingError('Unexpected network error');
    },
  });

export const axiosGet = (url: string, config?: AxiosRequestConfig<unknown>) =>
  Effect.tryPromise({
    try: () => client.get(url, config),
    catch: (unknown) => {
      return isAxiosError(unknown)
        ? new NetworkingError(unknown.message, unknown.response.status)
        : new NetworkingError('Unexpected network error');
    },
  });

export const axiosGenerateRegistrationOptions = (email: string) => {
  const data = {
    email,
  };
  return axiosPost('webauthn/register/generate-options', data);
};

export const axiosVerifyRegistrationOptions = (
  registrationResponse: RegistrationResponseJSON
) => {
  return axiosPost('webauthn/register/verify', registrationResponse);
};

export const axiosGenerateAuthenticationOptions = () => {
  return axiosGet('webauthn/authenticate/generate-options');
};

export const axiosVerifyAuthenticationOptions = (
  authResponse: AuthenticationResponseJSON
) => {
  return axiosPost('webauthn/authenticate/verify', authResponse);
};

export const axiosProfile = (jwt: string) =>
  axiosGet('profile', { headers: { Authorization: `Bearer ${jwt}` } });
