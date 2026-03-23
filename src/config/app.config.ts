import { registerAs } from '@nestjs/config';

export interface AppPrefixConfig {
  label: string;
  prefix: string;
}

const defaultAppPrefixes: AppPrefixConfig[] = [
  { label: 'VS Code', prefix: 'vscode://file/' },
  { label: 'Cursor', prefix: 'cursor://' },
];

export default registerAs('app', () => ({
  name: process.env.APP_NAME ?? 'SuperBookmarks',
  port: Number.parseInt(process.env.PORT ?? '3000', 10),
  environment: process.env.NODE_ENV ?? 'development',
  basicAuth: {
    username: process.env.BASIC_AUTH_USERNAME ?? 'admin',
    password: process.env.BASIC_AUTH_PASSWORD ?? 'admin',
    realm: process.env.BASIC_AUTH_REALM ?? 'SuperBookmarks',
  },
  settings: {
    defaultTheme: process.env.DEFAULT_THEME ?? 'dark',
    appPrefixes: parseAppPrefixes(process.env.DEFAULT_APP_PREFIXES),
  },
  swagger: {
    path: process.env.SWAGGER_PATH ?? 'docs',
  },
}));

function parseAppPrefixes(value?: string): AppPrefixConfig[] {
  if (!value) {
    return defaultAppPrefixes;
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return defaultAppPrefixes;
    }

    return parsed.filter(isAppPrefixConfig);
  } catch {
    return defaultAppPrefixes;
  }
}

function isAppPrefixConfig(entry: unknown): entry is AppPrefixConfig {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const candidate = entry as Record<string, unknown>;
  return (
    typeof candidate.label === 'string' && typeof candidate.prefix === 'string'
  );
}
