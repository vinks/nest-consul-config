export interface ConsulConfigOptions {
  key: string;
  retry?: number;
}

export interface Options {
  key: string;
  rename?: (key: string, env?: string) => string;
  retry?: number;
}

export interface BootOptions {
  path: string;
  rename?: (key: string, env?: string) => string;
  retry?: number;
}
