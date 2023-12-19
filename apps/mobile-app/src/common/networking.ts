import axios from 'axios';
import { config } from './config';
import { Effect } from 'effect';

export type NetworkingError = {
  __tag: 'NetworkingError';
  status?: string;
  message: string;
};

const isAxiosError = (e: unknown): e is { status: string; message: string } => {
  if (typeof e === 'object' && e !== null && 'message' in e && 'status' in e) {
    return 'message' in e && 'status' in e;
  }
  return false;
};

export const axiosGenerateRegistrationOptions = (email: string) => {
  const url = new URL('webauthn/register/generate-options', config.endpoint);
  const data = {
    email,
  };
  return axios.post(url.href, data);
};

export const requestRegistrationOptions = (email: string) =>
  Effect.tryPromise({
    try: () => axiosGenerateRegistrationOptions(email),
    catch: (unknown) =>
      isAxiosError(unknown)
        ? {
            _tag: 'NetworkingError',
            status: unknown.status,
            message: unknown.message,
          }
        : {
            _tag: 'NetworkingError',
            message: 'Unexpected network error',
          },
  });
