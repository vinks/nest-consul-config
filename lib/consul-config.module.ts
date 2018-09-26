import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConsulConfig } from './consul-config.class';
import * as Consul from 'consul';
import { Options } from './consul-config.options';
import { IBoot } from './boot.interface';
import {
    BOOT_ADAPTER,
    BOOTSTRAP_PROVIDER,
    CONSUL_CONFIG_PROVIDER,
    CONSUL_PROVIDER,
} from './constants';

@Global()
@Module({})
export class ConsulConfigModule {
    static register(options: Options): DynamicModule {
        const inject = [];
        if (options.adapter === BOOT_ADAPTER) {
            inject.push(BOOTSTRAP_PROVIDER);
        }
        const consulConfigProvider = {
            provide: CONSUL_CONFIG_PROVIDER,
            useFactory: async (
                consul: Consul,
                boot: IBoot,
            ): Promise<ConsulConfig> => {
                const env = process.env.NODE_ENV || 'development';
                let key = options.key;
                let retry = options.retry;
                if (options.adapter === BOOT_ADAPTER) {
                    key = boot.get('consul.config.key');
                    retry = boot.get('consul.config.retry', 5);
                    const serviceName = boot.get('web.serviceName', 'localhost');
                    const serviceId = boot.get('web.serviceId', '');

                    if (!key) {
                        throw new Error('Please set consul.config.key in bootstrap.yml');
                    }
                    key = key
                        .replace('{env}', env)
                        .replace('{serviceName}', serviceName)
                        .replace('{serviceId}', serviceId);
                }
                const client = new ConsulConfig(consul, key, { retry });
                await client.init();
                return client;
            },
            inject,
        };

        return {
            module: ConsulConfigModule,
            components: [consulConfigProvider],
            exports: [consulConfigProvider],
        };
    }
}
