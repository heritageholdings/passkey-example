# PasskeyExample

An example repository showcasing an end to end example of passkey registration and authentication on a mobile app using WebAuthn and Expo.
For further details about the implementation, the architecture and the technologies used, please refer to the related article (TBD insert link).

Please remember that this repository serves as a showcase, offering a demonstration of both backend and frontend code essential for implementing passkey authentication. It is important to note that certain simplifications have been incorporated into the code to enhance readability and understanding and is not intended for production use as would be needed to adapt and enhance the code for production environments according to best practices and security standards.

## Prerequisites
- [Node.js](https://nodejs.org/en/) (v18.8.0)
- [Yarn](https://yarnpkg.com/) (v1.22.19)
- [Ruby](https://www.ruby-lang.org/en/) (v3.0.0)

in addition to these, this repository provides a practical demonstration leveraging [Ngrok](https://ngrok.com/) to acquire a complimentary static subdomain and expose your local server to the internet, in order to simplify the configuration required by the Apple associated domains.
For step-by-step guidance on installation, please visit the [Ngrok website](https://ngrok.com/download). Once the installation and registration processes are completed, users can easily procure a free static endpoint through the [Ngrok dashboard](https://dashboard.ngrok.com) under Cloud Edge > Endpoints.

## Setup

- Run `yarn install` to install all dependencies
- Run `cp .env.example .env` to create the `.env` file and fill it with the required values:

| Variable | Description                                                                                                                                                                                               |
| --- |-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `WEBAUTHN_RPID` | The Relying Party ID (RP ID) is a unique identifier for the Relying Party entity, which is the application that is using WebAuthn to authenticate users. Insert here the Ngrok free static subdomain.     |
| `WEBAUTHN_RPORIGIN` | The origin of the Relying Party, automatically valued via `WEBAUTHN_RPID`.                                                                                                                                |
| `WEBAUTHN_RPNAME` | The name of the Relying Party, you can use whatever name you prefer.                                                                                                                                      |
| `WEBAUTHN_ANDROID_CERT_FINGERPRINTS` | The SHA-256 hashes of the Android key pairs used to sign the app. You can obtain this running `./gradlew signingReport` in the `apps/mobile-app/android` folder, loooking for the task :app:signingReport |
| `WEBAUTHN_IOS_TEAM_ID` | The Team ID of the Apple Developer account used to sign the app                                                                                                                                           |

- Run `yarn nx run backend:serve:development` to start the backend server
- Run `ngrok http --domain=your-ngrok-domain.ngrok-free.app 3000` to start ngrok and expose the backend server to the internet
- Run `yarn nx prebuild mobile-app` to generate the native iOS and Android projects using Expo Prebuild
- Run `yarn nx run mobile-app:run-ios` to start the iOS app or `yarn nx run mobile-app:run-android` to start the Android app

# How to run

If you have followed the setup steps, you should have the backend server running on your local machine and the mobile app running on your device/emulator.
The mobile app will allow you to register a new credential, inserting an email and pressing the `Register` button. 
If everything is configured correctly, the new passkey registration ceremony should begin and the user is prompted to register a new passkey by authenticating via biometric

| Login / Registration                                                                                                                                                       | Passkey Registration                                                                                                                                                       | Passkey Registration with Face ID                                                                                                                                         |
|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <img width=300 src="https://raw.githubusercontent.com/heritageholdings/passkey-example/master/docs/img/first_screen.png"> | <img width=300 src="https://raw.githubusercontent.com/heritageholdings/passkey-example/master/docs/img/first_screen.png"> | <img width=300 src="https://raw.githubusercontent.com/heritageholdings/passkey-example/master/docs/img/first_screen.png"> |

If the passkey registration is successful, the user is directed to the home screen, where the user will be able to see his email, the IDs of the authenticators registered by him (and a panda holding a bamboo passkey!). From here you can log out to test logging in with the passkey you just registered

<img width=300 src="https://raw.githubusercontent.com/heritageholdings/passkey-example/master/docs/img/first_screen.png">

Once you return to the first authentication screen, you can enter the previously registered email and press "Login". At this point the authentication ceremony will begin which will allow you to re-access the application using the previously registered passkey.

<img width=300 src="https://raw.githubusercontent.com/heritageholdings/passkey-example/master/docs/img/first_screen.png">

If any error occurs during execution, registration or authentication, check the logs of either the mobile app or the backend

Please remember that in this simple demo, the backend server is not persistent, so if you restart it, all the registered credentials will be lost!
