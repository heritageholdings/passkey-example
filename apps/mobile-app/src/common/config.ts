import * as S from '@effect/schema/Schema';

console.log(process.env.EXPO_PUBLIC_ENDPOINT);
export const config = {
  endpoint: S.parseSync(S.string)(process.env.EXPO_PUBLIC_ENDPOINT),
};
