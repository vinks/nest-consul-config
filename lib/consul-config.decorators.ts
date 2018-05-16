import { Inject } from '@nestjs/common';

export const InjectConfig = () => Inject('ConsulConfigClient');
