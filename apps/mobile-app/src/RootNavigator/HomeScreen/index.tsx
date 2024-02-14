import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../common/components/Button';
import { jwtAtom } from '../../common/state/jwt';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { axiosProfile } from '../../common/networking';
import { Effect, Exit, pipe } from 'effect';
import Toast from 'react-native-toast-message';
import * as S from '@effect/schema/Schema';
import { ProfileResponse } from '@passkey-example/api-schema';
import Icon from '../../../assets/splash.png';

const styles = StyleSheet.create({
  center: { alignSelf: 'center' },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  image: {
    width: 250,
    height: 250,
    marginTop: 16,
  },
});

export const HomeScreen: React.FC = () => {
  const [jwt, setJwt] = useAtom(jwtAtom);
  const [loading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<ProfileResponse | undefined>();

  useEffect(() => {
    const loadProfile = async () => {
      if (jwt === undefined) return;
      setLoading(true);
      const results = await Effect.runPromiseExit(
        pipe(
          axiosProfile(jwt),
          Effect.map((response) => response.data),
          Effect.flatMap(S.parseEither(ProfileResponse))
        )
      );
      Exit.match(results, {
        onFailure: (e) => {
          // If we receive a 401, it means that the session has expired and we need to logout
          if (
            e._tag === 'Fail' &&
            e.error._tag === 'NetworkingError' &&
            e.error.status === 401
          ) {
            console.log("Session expired, let's logout");
            Toast.show({
              type: 'error',
              text1: 'Session expired',
              text2: `Your session has expired, please login again.`,
            });
            setJwt(undefined);
          } else {
            console.error(e);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: `An error occurred, see the console for more details.`,
            });
          }
        },
        onSuccess: setProfile,
      });

      setLoading(false);
    };
    void loadProfile();
  }, [jwt, setJwt]);

  console.log(profile);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {loading && <ActivityIndicator size="large" />}
        {profile && !loading && (
          <>
            <Image source={Icon} style={[styles.image, styles.center]} />
            <Text style={[styles.center, styles.title]}>
              You're logged in {profile.email}!
            </Text>
            <Text style={[styles.center]}>
              You've registered {profile.authenticators?.length ?? 0} passkey
              {(profile.authenticators?.length ?? 0) > 1 ? 's' : ''}:
            </Text>
            {profile.authenticators?.map((authenticator) => (
              <Text key={authenticator.credentialID} style={[styles.center]}>
                {authenticator.credentialID}
              </Text>
            ))}
          </>
        )}
      </View>
      <View>
        <Button title={'Logout'} onPress={() => setJwt(undefined)} />
      </View>
    </SafeAreaView>
  );
};
