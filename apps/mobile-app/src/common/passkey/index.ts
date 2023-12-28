import { authenticatePasskey } from './authenticate';
import { registerPasskey } from './register';

export const Passkey = {
  authenticate: authenticatePasskey,
  register: registerPasskey,
};
