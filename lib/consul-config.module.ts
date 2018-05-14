import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConsulConfig } from './consul-config.class';
import * as Consul from 'consul';

@Global()
@Module({})
export class ConsulConfigModule {
  static forRoot(key: string): DynamicModule {
    const bootstrapProvider = {
      provide: 'ConsulConfigClient',
      useFactory: async (consul: Consul): Promise<ConsulConfig> => {
        const client = new ConsulConfig(consul, key);
        await client.init();
        return client;
      },
      inject: ['ConsulClient'],
    };
    return {
      module: ConsulConfigModule,
      components: [bootstrapProvider],
      exports: [bootstrapProvider],
    };
  }
}
