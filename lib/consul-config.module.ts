import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConsulConfig } from './consul-config.class';
import * as Consul from 'consul';
import { BootOptions, Options } from './consul-config.options';
import { Boot } from 'nest-boot';

@Global()
@Module({})
export class ConsulConfigModule {
  static init(options: Options): DynamicModule {
    const env = process.env.NODE_ENV || 'development';

    const consulConfigProvider = {
      provide: 'ConsulConfigClient',
      useFactory: async (consul: Consul, boot: Boot): Promise<ConsulConfig> => {
        let key = options.key;
        if (typeof options.rename == 'function') {
          key = options.rename(key, env);
        }

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

  static initWithBoot(options: BootOptions): DynamicModule {
    const env = process.env.NODE_ENV || 'development';
    const consulConfigProvider = {
      provide: 'ConsulConfigClient',
      useFactory: async (consul: Consul, boot: Boot): Promise<ConsulConfig> => {
        let key = boot.get(options.path);
        if (typeof options.rename == 'function') {
          key = options.rename(key, env);
        }
        const client = new ConsulConfig(consul, key, {
          key,
          retry: options.retry,
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
