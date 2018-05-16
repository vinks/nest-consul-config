export interface ConsulConfigOptions {
  key?: string;
  useBootModule?: boolean;
  bootPath?: string;
  rename?: (key: string, env?: string) => string;
  retry?: number;
}
