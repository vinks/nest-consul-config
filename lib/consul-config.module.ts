import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConsulConfig } from './consul-config.class';
import * as Consul from 'consul';
import { ConsulConfigOptions } from './consul-config.options';

@Global()
@Module({})
export class ConsulConfigModule {
  static forRoot(options: ConsulConfigOptions): DynamicModule {
    const env = process.env.NODE_ENV || 'development';
    const consulConfigProvider = {
      provide: 'ConsulConfigClient',
      useFactory: async (consul: Consul, bootstrap): Promise<ConsulConfig> => {
        let key = options.key;
        if (options.bootstrap) {
          key = bootstrap.get(options.bootstrapPath);
        }

        if (typeof options.rule == 'function') {
          key = options.rule(key, env);
        }
        const client = new ConsulConfig(consul, key, options);
        await client.init();
        return client;
      },
      inject: ['ConsulClient'],
    };

    if (options.bootstrap) {
      consulConfigProvider.inject.push('BootstrapProvider');
    }

    return {
      module: ConsulConfigModule,
      components: [consulConfigProvider],
      exports: [consulConfigProvider],
    };
  }
}
