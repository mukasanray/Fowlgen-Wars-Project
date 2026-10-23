import type { InstallOptions } from './types';

export const DEFAULT_OPTIONS: InstallOptions = {
  checkOnly: false,
  withOpenSign: false,
  skipOpenSign: false,
  start: true,
  interactive: Boolean(process.stdin.isTTY),
  force: false,
  json: false,
  help: false,
  kanbanPort: 3000,
  opensignPort: 3001
};
