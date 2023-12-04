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
 * The server send to the client the challenge to register a new passkey
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
