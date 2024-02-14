import * as S from '@effect/schema/Schema';
import {
  AttestationConveyancePreference,
  AuthenticationExtensionsClientOutputs,
  AuthenticatorAssertionResponseJSON,
  AuthenticatorAttachment,
  AuthenticatorAttestationResponseJSON,
  AuthenticatorSelectionCriteria,
  PublicKeyCredentialDescriptor,
  PublicKeyCredentialParameters,
  PublicKeyCredentialRpEntity,
  PublicKeyCredentialUserEntity,
  UserVerificationRequirement,
} from './internalTypes';

/**
 * This file contains the schema used to verify the payloads exchanged between the client and the server during the
 * registration of a new passkey and the authentication of an existing one.
 *
 * Registration:
 * - The client asks the server for the registration options {@link CredentialCreationOptions}
 * - The server sends the registration options to the client {@link CredentialCreationOptions}
 * - The client signs the registration options and sends the result {@link RegistrationResponseJSON} to the server
 * - The server validate the signed registration options {@link RegistrationResponseJSON} and register the passkey
 *
 * Authentication:
 * - The client asks the server for the authentication options {@link PublicKeyCredentialRequestOptions}
 * - The server sends the authentication options to the client {@link PublicKeyCredentialRequestOptions}
 * - The client signs the authentication options and sends the result {@link AuthenticationResponseJSON} to the server
 * - The server validate the signed authentication options {@link AuthenticationResponseJSON} and authenticate the passkey, returning a new valid session
 *
 */

/**
 * The client request to the server to generate the registration options providing the user email
 */
export const CredentialCreationOptionsRequest = S.struct({
  email: S.string.pipe(
    S.pattern(new RegExp('^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$'))
  ),
});

/**
 * The payload returned after the registration or authentication verification
 */
export const JwtTokenResponse = S.struct({
  token: S.string,
});

/**
 * The body returned by the /profile endpoint after a successful authentication
 */
export const ProfileResponse = S.struct({
  email: S.string,
  authenticators: S.array(S.struct({ credentialID: S.string })).pipe(
    S.optional
  ),
});

export type ProfileResponse = S.Schema.To<typeof ProfileResponse>;

/**
 * Registration Challenge request:
 * The server send to the client the challenge in order to register a new passkey
 * see https://w3c.github.io/webauthn/#dictionary-makecredentialoptions
 */
export const CredentialCreationOptions = S.struct({
  rp: PublicKeyCredentialRpEntity,
  user: PublicKeyCredentialUserEntity,
  challenge: S.string,
  pubKeyCredParams: S.mutable(S.array(PublicKeyCredentialParameters)),
  // should be optional, changed for library compatibility
  timeout: S.number,
  // should be optional, changed for library compatibility
  attestation: AttestationConveyancePreference,
  // should be optional, changed for library compatibility
  authenticatorSelection: AuthenticatorSelectionCriteria,

  excludeCredentials: S.mutable(S.array(PublicKeyCredentialDescriptor)).pipe(
    S.optional
  ),
  attestationFormats: S.mutable(S.array(S.string)).pipe(S.optional),
  extensions: S.record(S.string, S.unknown).pipe(S.optional),
});

export type CredentialCreationOptions = S.Schema.To<
  typeof CredentialCreationOptions
>;

/*
 * Registration Verification:
 * The FIDO2 Attestation Result, see https://w3c.github.io/webauthn/#dictdef-registrationresponsejson
 * In addition to the standard, we add the createdFrom and createdPlatform fields
 * to track where the registration was created from.
 * The response that the client sends to the server after signing in the previous received challenge,
 * to complete registration of a new passkey
 */
export const RegistrationResponseJSON = S.struct({
  id: S.string,
  rawId: S.string,
  response: AuthenticatorAttestationResponseJSON,
  clientExtensionResults: AuthenticationExtensionsClientOutputs,
  type: S.literal('public-key'),

  authenticatorAttachment: AuthenticatorAttachment.pipe(S.optional),
  // Not part of the standard, added for simplify the registration ceremony, please refer to https://simplewebauthn.dev/docs/advanced/passkeys#remembering-challenges for a proper implementation of the challenge remembering
  email: S.string,
});

export type RegistrationResponseJSON = S.Schema.To<
  typeof RegistrationResponseJSON
>;

/**
 * Authentication Request:
 * The {@link PublicKeyCredentialRequestOptions} that the server sends to the client to authenticate
 * see https://w3c.github.io/webauthn/#dictionary-assertion-options
 */
export const PublicKeyCredentialRequestOptions = S.struct({
  challenge: S.string,
  rpId: S.string,
  timeout: S.number,
  userVerification: UserVerificationRequirement,

  allowCredentials: S.mutable(S.array(PublicKeyCredentialDescriptor)).pipe(
    S.optional
  ),
  attestation: S.string.pipe(S.optional),
  attestationFormats: S.mutable(S.array(S.string)).pipe(S.optional),
  extensions: S.record(S.string, S.unknown).pipe(S.optional),
});

export type PublicKeyCredentialRequestOptions = S.Schema.To<
  typeof PublicKeyCredentialRequestOptions
>;

/**
 * Authentication Verification:
 * The response that the client sends to the server after signing in the previous received challenge
 * see https://w3c.github.io/webauthn/#dictdef-authenticationresponsejson
 */
export const AuthenticationResponseJSON = S.struct({
  id: S.string,
  rawId: S.string,
  response: AuthenticatorAssertionResponseJSON,
  clientExtensionResults: AuthenticationExtensionsClientOutputs,
  type: S.literal('public-key'),

  authenticatorAttachment: AuthenticatorAttachment.pipe(S.optional),
});

export type AuthenticationResponseJSON = S.Schema.To<
  typeof AuthenticationResponseJSON
>;
