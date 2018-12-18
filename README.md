<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

This is a [Nest](https://github.com/nestjs/nest) module to get configurations from consul kv.

## Installation

```bash
$ npm i --save nest-consul consul nest-consul-config
```

## Quick Start

#### Import Module

```typescript
import { Module } from '@nestjs/common';
import { ConsulModule } from 'nest-consul';
import { ConsulConfigModule } from 'nest-consul-config';

const env = process.env.NODE_ENV;

@Module({
  imports: [
      ConsulModule.register({
        host: '127.0.0.1',
        port: 8500
      }),
      ConsulConfigModule.register({key: `config__user-service__${env}`})
  ],
})
export class ApplicationModule {}
```

If you use [nest-boot](https://github.com/miaowing/nest-boot) module.

```typescript
import { Module } from '@nestjs/common';
import { ConsulModule } from 'nest-consul';
import { ConsulConfigModule } from 'nest-consul-config';
import { BootModule, BOOT_ADAPTER } from 'nest-boot';

@Module({
  imports: [
      ConsulModule.register({adapter: BOOT_ADAPTER}),
      BootModule.register(__dirname, 'bootstrap.yml'),
      ConsulConfigModule.register({adapter: BOOT_ADAPTER})
  ],
})
export class ApplicationModule {}
```

##### bootstrap.yml

```yaml
web:
  serviceId:
  serviceName: user-service
consul:
  host: localhost
  port: 8500
  config:
    # available expressions: {serviceName} {serviceId} {env}
    key: config__{serviceName}__{env}
    retry: 5
```

#### Config Client Injection

In consul kv, the key is "config__user-service__development".

```yaml
user:
  info:
    name: 'test'
```

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConfig, ConsulConfig } from 'nest-consul-config';

@Injectable()
export class TestService {
  constructor(
      @InjectConfig() private readonly config: ConsulConfig
  ) {}

  getUserInfo() {
      const userInfo = this.config.get('user.info', {name: 'judi'});
      console.log(userInfo);
  }
}
```

Dynamic config update:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectConfig, ConsulConfig, DynamicConfig, ConfigValue, OnUpdate } from 'nest-consul-config';

@Injectable()
export class TestService extends DynamicConfig implements OnUpdate {
  @ConfigValue('user.info', {name: 'judi'})
  private readonly userInfo;
  
  constructor(
      @InjectConfig() private readonly config: ConsulConfig
  ) {
      super(config);
  }
  
  onUpdate() {
      // Some service need re-initial after the config updated, you can execute it here.
  }

  getUserInfo() {
      return this.userInfo;
  }
}
```

## Stay in touch

- Author - [Miaowing](https://github.com/miaowing)

## License

  Nest is [MIT licensed](LICENSE).
