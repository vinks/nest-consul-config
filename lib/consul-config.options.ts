export interface ConsulConfigOptions {
  key?: string;
  bootstrap?: boolean;
  bootstrapPath?: string;
  rule?: (key: string) => string;
  retry?: number;
}
