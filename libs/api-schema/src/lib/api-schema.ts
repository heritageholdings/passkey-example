import * as S from '@effect/schema/Schema';

// https://w3c.github.io/webauthn/#enum-transport
const AuthenticatorTransportFuture = S.literal(
  'ble',
  'internal',
  'nfc',
  'usb',
  'cable',
  'smart-card',
  'hybrid'
);

// https://w3c.github.io/webauthn/#dom-authenticatorselectioncriteria-authenticatorattachment
const AuthenticatorAttachment = S.literal('cross-platform', 'platform');

// https://w3c.github.io/webauthn/#enum-residentKeyRequirement
const ResidentKeyRequirement = S.literal(
  'discouraged',
  'preferred',
  'required'
);

// https://w3c.github.io/webauthn/#enumdef-userverificationrequirement
const UserVerificationRequirement = S.literal(
  'discouraged',
  'preferred',
  'required'
);

// https://w3c.github.io/webauthn/#enumdef-attestationconveyancepreference
const AttestationConveyancePreference = S.literal(
  'direct',
  'enterprise',
  'indirect',
  'none'
);

// https://w3c.github.io/webauthn/#dictdef-publickeycredentialentity
const PublicKeyCredentialEntity = S.struct({
  name: S.string,
});

// https://w3c.github.io/webauthn/#dictdef-publickeycredentialrpentity

const PublicKeyCredentialRpEntity = PublicKeyCredentialEntity.pipe(
  S.extend(
    S.struct({
      id: S.string,
    })
  )
);

// https://w3c.github.io/webauthn/#dictdef-publickeycredentialuserentity
const PublicKeyCredentialUserEntity = PublicKeyCredentialEntity.pipe(
  S.extend(
    S.struct({
      id: S.string,
      displayName: S.string,
    })
  )
);

// https://w3c.github.io/webauthn/#dictdef-publickeycredentialparameters
const PublicKeyCredentialParameters = S.struct({
  type: S.literal('public-key'),
  alg: S.number,
});

// https://w3c.github.io/webauthn/#dictdef-publickeycredentialdescriptor
const PublicKeyCredentialDescriptor = S.struct({
  id: S.string,
  type: S.literal('public-key'),
  transports: S.array(AuthenticatorTransportFuture).pipe(S.optional),
});

// https://w3c.github.io/webauthn/#dictdef-authenticatorselectioncriteria
const AuthenticatorSelectionCriteria = S.struct({
  authenticatorAttachment: AuthenticatorAttachment.pipe(S.optional),
  requireResidentKey: S.boolean.pipe(S.optional),
  residentKey: ResidentKeyRequirement.pipe(S.optional),
  userVerification: UserVerificationRequirement.pipe(S.optional),
});

/**
 * Registration Challenge request:
 * The server send to the client the challenge in order to register a new passkey
 * see https://w3c.github.io/webauthn/#dictionary-makecredentialoptions
 */
export const CredentialCreationOptions = S.struct({
  rp: PublicKeyCredentialRpEntity,
  user: PublicKeyCredentialUserEntity,
  challenge: S.string,
  pubKeyCredParams: S.array(PublicKeyCredentialParameters),
  // should be optional, changed for library compatibility
  timeout: S.number,
  // should be optional, changed for library compatibility
  attestation: AttestationConveyancePreference,
  // should be optional, changed for library compatibility
  authenticatorSelection: AuthenticatorSelectionCriteria,

  excludeCredentials: S.array(PublicKeyCredentialDescriptor).pipe(S.optional),
  attestationFormats: S.array(S.string).pipe(S.optional),
  extensions: S.record(S.string, S.unknown).pipe(S.optional),
});

export type CredentialCreationOptions = S.Schema.To<
  typeof CredentialCreationOptions
>;

// https://w3c.github.io/webauthn/#dictdef-authenticatorattestationresponsejson
const AuthenticatorAttestationResponseJSON = S.struct({
  clientDataJSON: S.string,
  attestationObject: S.string,
  transports: S.array(AuthenticatorTransportFuture).pipe(S.optional),
});

// https://w3c.github.io/webauthn/#dictdef-credentialpropertiesoutput
const AuthenticationExtensionsClientOutputs = S.struct({
  appid: S.boolean,
  credProps: S.struct({
    rk: S.boolean.pipe(S.optional),
  }),
  hmacCreateSecret: S.boolean,
});

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
  createdDevice: S.string.pipe(S.optional),
});

export type RegistrationResponseJSON = S.Schema.To<
  typeof RegistrationResponseJSON
>;

// https://w3c.github.io/webauthn/#dictdef-authenticatorassertionresponsejson
const AuthenticatorAssertionResponseJSON = S.struct({
  clientDataJSON: S.string,
  authenticatorData: S.string,
  signature: S.string,
  userHandle: S.string.pipe(S.optional),
});

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

  allowCredentials: S.array(PublicKeyCredentialDescriptor).pipe(S.optional),
  attestation: S.string.pipe(S.optional),
  attestationFormats: S.array(S.string).pipe(S.optional),
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
