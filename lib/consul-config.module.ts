import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConsulConfig } from './consul-config.class';
import * as Consul from 'consul';
import { ConsulConfigOptions } from './consul-config.options';
import { Boot } from 'nest-boot';

@Global()
@Module({})
export class ConsulConfigModule {
  static forRoot(options: ConsulConfigOptions): DynamicModule {
    const env = process.env.NODE_ENV || 'development';
    const consulConfigProvider = {
      provide: 'ConsulConfigClient',
      useFactory: async (consul: Consul, boot: Boot): Promise<ConsulConfig> => {
        let key = options.key;
        if (options.useBootModule) {
          key = boot.get(options.bootPath);
        }

        if (typeof options.rename == 'function') {
          key = options.rename(key, env);
        }
        const client = new ConsulConfig(consul, key, options);
        await client.init();
        return client;
      },
      inject: ['ConsulClient'],
    };

    if (options.useBootModule) {
      consulConfigProvider.inject.push('BootstrapProvider');
    }

    return {
      module: ConsulConfigModule,
      components: [consulConfigProvider],
      exports: [consulConfigProvider],
    };
  }
}
