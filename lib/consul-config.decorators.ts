import { Inject } from '@nestjs/common';

export const InjectConsulConfig = () => Inject('ConsulConfigClient');
