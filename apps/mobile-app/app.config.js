module.exports = ({ config }) => {
  if (!process.env.EXPO_PUBLIC_BACKEND_DOMAIN) {
    throw new Error(
      'EXPO_PUBLIC_BACKEND_DOMAIN environment variable is missing, please add it to .env file'
    );
  }

  return {
    ...config,
    ios: {
      ...config.ios,
      associatedDomains: [
        `webcredentials:${process.env.EXPO_PUBLIC_BACKEND_DOMAIN}`,
      ],
    },
  };
};
