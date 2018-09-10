import { Inject } from '@nestjs/common';
import { CONSUL_CONFIG_PROVIDER } from './constants';

export const InjectConfig = () => Inject(CONSUL_CONFIG_PROVIDER);
