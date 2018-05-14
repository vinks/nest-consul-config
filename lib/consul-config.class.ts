import * as Consul from 'consul';
import { get, set } from 'lodash';
import * as YAML from 'yamljs';

export class ConsulConfig {
  private configs: object;
  private readonly consul: Consul;
  private readonly key: string;

  constructor(consul: Consul, key: string) {
    this.consul = consul;
    this.key = key;
  }

  async init() {
    const result = await this.consul.get(this.key);
    try {
      this.configs = YAML.parse(result.Value);
    } catch (e) {
      this.configs = { parseErr: e };
    }
    this.watch();
  }

  private watch() {
    const watcher = this.consul.watch({
      method: this.consul.kv.get,
      options: { key: this.key },
    });
    watcher.on('change', (data, res) => {
      try {
        this.configs = YAML.parse(data);
      } catch (e) {
        this.configs = { parseErr: e };
      }
    });
    watcher.on('error', err => {
      watcher.end();
      setTimeout(() => this.watch(), 5000);
    });
  }

  get(path, defaults) {
    return get(this.configs, path, defaults);
  }

  async set(path, value) {
    set(this.configs, path, value);
    const yamlString = YAML.stringify(this.configs);
    await this.consul.kv.set(this.key, yamlString);
  }
}