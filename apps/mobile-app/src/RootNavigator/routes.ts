export const RootRoutes = {
  Authentication: 'Authentication',
  Home: 'Home',
} as const;

export type RootStackParamList = {
  [RootRoutes.Authentication]: undefined;
  [RootRoutes.Home]: undefined;
};
