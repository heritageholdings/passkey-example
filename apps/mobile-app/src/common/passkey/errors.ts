import * as S from '@effect/schema/Schema';
import { Either, pipe } from 'effect';

const PasskeyLibraryNativeError = S.struct({
  error: S.string,
  message: S.string,
});

export class ExcludedCredentialExistsError {
  public readonly _tag = 'ExcludedCredentialExistsError';
}
export class UserCancelledError {
  public readonly _tag = 'UserCancelledError';
}

export class PasskeyNativeError {
  public readonly _tag = 'PasskeyNative';
  public readonly message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export const parsePasskeyError = (e: unknown) =>
  pipe(
    e,
    S.parseEither(PasskeyLibraryNativeError),
    Either.map((nativeError) => {
      if (nativeError.message.includes('InvalidStateError')) {
        return new ExcludedCredentialExistsError();
      }
      switch (nativeError.error) {
        case 'UserCancelled':
          return new UserCancelledError();
        default:
          return new PasskeyNativeError(nativeError.message);
      }
    }),
    Either.getOrElse(() => {
      return new PasskeyNativeError('Generic native error');
    })
  );
