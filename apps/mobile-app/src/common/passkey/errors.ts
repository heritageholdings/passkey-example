import * as S from '@effect/schema/Schema';
import { Either, pipe } from 'effect';

const PasskeyLibraryNativeError = S.struct({
  error: S.string,
  message: S.string,
});

type ExcludedCredentialExistsError = {
  _tag: 'ExcludedCredentialExistsError';
};

type UserCancelledError = {
  _tag: 'UserCancelledError';
};

type PasskeyNativeError = {
  _tag: 'PasskeyNativeError';
  message: string;
};

export const parsePasskeyError = (e: unknown) =>
  pipe(
    e,
    S.parseEither(PasskeyLibraryNativeError),
    Either.map((nativeError) => {
      if (nativeError.message.includes('InvalidStateError')) {
        return {
          kind: 'excludedCredentialExists',
        };
      }
      switch (nativeError.error) {
        case 'UserCancelled':
          return {
            kind: 'userCancelled',
          };
        default:
          return {
            kind: 'native',
            message: nativeError.message,
          };
      }
    }),
    Either.getOrElse(() => {
      return {
        kind: 'native',
        message: 'Generic native error',
      };
    })
  );
