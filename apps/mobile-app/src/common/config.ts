import * as S from '@effect/schema/Schema';

if (!process.env.EXPO_PUBLIC_BACKEND_DOMAIN)
  throw new Error('EXPO_PUBLIC_BACKEND_DOMAIN not set, please add it to .env');
export const config = {
  endpoint: `https://${S.parseSync(S.string)(
    process.env.EXPO_PUBLIC_BACKEND_DOMAIN
  )}`,
};
