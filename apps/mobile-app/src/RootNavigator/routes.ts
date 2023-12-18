export const RootRoutes = {
  Authentication: 'Authentication',
  Registration: 'Registration',
  Home: 'Home',
} as const;

export type RootStackParamList = {
  [RootRoutes.Authentication]: undefined;
  [RootRoutes.Registration]: undefined;
  [RootRoutes.Home]: undefined;
};
