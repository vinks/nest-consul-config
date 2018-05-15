export interface ConsulConfigOptions {
  key?: string;
  bootstrap?: boolean;
  bootstrapPath?: string;
  rule?: (key: string, env?: string) => string;
  retry?: number;
}
