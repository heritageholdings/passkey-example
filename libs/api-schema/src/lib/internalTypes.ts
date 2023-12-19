// https://w3c.github.io/webauthn/#enum-transport
import * as S from '@effect/schema/Schema';

export const AuthenticatorTransportFuture = S.literal(
  'ble',
  'internal',
  'nfc',
  'usb',
  'cable',
  'smart-card',
  'hybrid'
);

// https://w3c.github.io/webauthn/#dom-authenticatorselectioncriteria-authenticatorattachment
export const AuthenticatorAttachment = S.literal('cross-platform', 'platform');

// https://w3c.github.io/webauthn/#enum-residentKeyRequirement
export const ResidentKeyRequirement = S.literal(
  'discouraged',
  'preferred',
  'required'
);

// https://w3c.github.io/webauthn/#enumdef-userverificationrequirement
export const UserVerificationRequirement = S.literal(
  'discouraged',
  'preferred',
  'required'
);

// https://w3c.github.io/webauthn/#enumdef-attestationconveyancepreference
export const AttestationConveyancePreference = S.literal(
  'direct',
  'enterprise',
  'indirect',
  'none'
);

// https://w3c.github.io/webauthn/#dictdef-publickeycredentialentity
export const PublicKeyCredentialEntity = S.struct({
  name: S.string,
});

// https://w3c.github.io/webauthn/#dictdef-publickeycredentialrpentity

export const PublicKeyCredentialRpEntity = PublicKeyCredentialEntity.pipe(
  S.extend(
    S.struct({
      id: S.string,
    })
  )
);

// https://w3c.github.io/webauthn/#dictdef-publickeycredentialuserentity
export const PublicKeyCredentialUserEntity = PublicKeyCredentialEntity.pipe(
  S.extend(
    S.struct({
      id: S.string,
      displayName: S.string,
    })
  )
);

// https://w3c.github.io/webauthn/#dictdef-publickeycredentialparameters
export const PublicKeyCredentialParameters = S.struct({
  type: S.literal('public-key'),
  alg: S.number,
});

// https://w3c.github.io/webauthn/#dictdef-publickeycredentialdescriptor
export const PublicKeyCredentialDescriptor = S.struct({
  id: S.string,
  type: S.literal('public-key'),
  transports: S.mutable(S.array(AuthenticatorTransportFuture)).pipe(S.optional),
});

// https://w3c.github.io/webauthn/#dictdef-authenticatorselectioncriteria
export const AuthenticatorSelectionCriteria = S.struct({
  authenticatorAttachment: AuthenticatorAttachment.pipe(S.optional),
  requireResidentKey: S.boolean.pipe(S.optional),
  residentKey: ResidentKeyRequirement.pipe(S.optional),
  userVerification: UserVerificationRequirement.pipe(S.optional),
});

// https://w3c.github.io/webauthn/#dictdef-authenticatorattestationresponsejson
export const AuthenticatorAttestationResponseJSON = S.struct({
  clientDataJSON: S.string,
  authenticatorData: S.string.pipe(S.optional),
  publicKeyAlgorithm: S.number.pipe(S.optional),
  attestationObject: S.string,
  transports: S.mutable(S.array(AuthenticatorTransportFuture)).pipe(S.optional),
  publicKey: S.string.pipe(S.optional),
});

// https://w3c.github.io/webauthn/#dictdef-credentialpropertiesoutput
export const AuthenticationExtensionsClientOutputs = S.struct({
  appid: S.boolean.pipe(S.optional),
  credProps: S.struct({
    rk: S.boolean.pipe(S.optional),
  }).pipe(S.optional),
  hmacCreateSecret: S.boolean.pipe(S.optional),
});

// https://w3c.github.io/webauthn/#dictdef-authenticatorassertionresponsejson
export const AuthenticatorAssertionResponseJSON = S.struct({
  clientDataJSON: S.string,
  authenticatorData: S.string,
  signature: S.string,
  userHandle: S.string.pipe(S.optional),
});
