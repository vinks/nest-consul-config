import * as Consul from 'consul';
import { get, set } from 'lodash';
import * as YAML from 'yamljs';
import { ConsulConfigOptions } from './consul-config.options';

export class ConsulConfig {
    private configs: object;
    private callback: (configs) => void = () => void 0;
    private readonly consul: Consul;
    private readonly key: string;
    private readonly retry: number;

    constructor(consul: Consul, key: string, options: ConsulConfigOptions) {
        this.consul = consul;
        this.key = key;
        this.retry = options.retry;
    }

    async init() {
        const result = await this.consul.kv.get(this.key);
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
            options: { key: this.key, wait: '5m' },
        });
        watcher.on('change', (data, res) => {
            try {
                this.configs = YAML.parse(data.Value);
            } catch (e) {
                this.configs = { parseErr: e };
            }

            this.callback(this.configs);
        });
        watcher.on('error', err => {

        });
    }

    onChange(callback: (configs) => void) {
        this.callback = callback;
    }

    getKey(): string {
        return this.key;
    }

    get(path?: string, defaults?: any) {
        if (!path) {
            return this.configs;
        }
        return get(this.configs, path, defaults);
    }

    async set(path: string, value: any) {
        set(this.configs, path, value);
        const yamlString = YAML.stringify(this.configs);
        await this.consul.kv.set(this.key, yamlString);
    }
}
