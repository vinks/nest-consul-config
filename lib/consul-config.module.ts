import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConsulConfig } from './consul-config.class';
import * as Consul from 'consul';
import { Options } from './consul-config.options';
import { Boot } from 'nest-boot';

@Global()
@Module({})
export class ConsulConfigModule {
  static register(options: Options): DynamicModule {
    const consulConfigProvider = {
      provide: 'ConsulConfigClient',
      useFactory: async (consul: Consul): Promise<ConsulConfig> => {
        const key = options.key;
        const client = new ConsulConfig(consul, key, options);
        await client.init();
        return client;
      },
      inject: ['ConsulClient'],
    };

    return {
      module: ConsulConfigModule,
      components: [consulConfigProvider],
      exports: [consulConfigProvider],
    };
  }

  static registerByBoot(): DynamicModule {
    const env = process.env.NODE_ENV || 'development';
    const consulConfigProvider = {
      provide: 'ConsulConfigClient',
      useFactory: async (consul: Consul, boot: Boot): Promise<ConsulConfig> => {
        let key = boot.get('consul.config.key');
        const retry = boot.get('consul.config.retry', 5);
        const serviceName = boot.get('web.serviceName', 'localhost');
        const serviceId = boot.get('web.serviceId', '');

        if (!key) {
          throw new Error('Please set consul.config.key in bootstrap.yml');
        }
        key = key
          .replace('{env}', env)
          .replace('{serviceName}', serviceName)
          .replace('{serviceId}', serviceId);
        const client = new ConsulConfig(consul, key, {
          key,
          retry,
        });
        await client.init();
        return client;
      },
      inject: ['ConsulClient', 'BootstrapProvider'],
    };

    return {
      module: ConsulConfigModule,
      components: [consulConfigProvider],
      exports: [consulConfigProvider],
    };
  }
}
