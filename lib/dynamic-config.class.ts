import 'reflect-metadata';
import { ConsulConfig } from "./consul-config.class";
import { DYNAMIC_CONFIG_VALUE } from "./constants";

export const ConfigValue = (path: string, defaultValue?: any): PropertyDecorator => {
    return function (target: any, propertyName: string) {
        const values = Reflect.getMetadata(DYNAMIC_CONFIG_VALUE, target) || [];
        values.push({ path, defaultValue, propertyName });
        Reflect.defineMetadata(DYNAMIC_CONFIG_VALUE, values, target);
    }
};

export class DynamicConfig {
    protected constructor(config: ConsulConfig) {
        if (!config) {
            throw new Error('Please set consul config params before invoke DynamicBoot constructor.');
        }
        const values = Reflect.getMetadata(DYNAMIC_CONFIG_VALUE, new.target.prototype) || [];
        values.forEach(value => this[value.propertyName] = config.get(value.path, value.defaultValue));

        let updated = false;
        config.onChange(() => {
            values.forEach(value => {
                const oldVal = this[value.propertyName];
                const newVal = config.get(value.path, value.defaultValue);
                if (oldVal !== newVal) {
                    this[value.propertyName] = config.get(value.path, value.defaultValue);
                    updated = true;
                }
            });
        });
        if (updated && typeof this['onUpdate'] === 'function') {
            this['onUpdate']();
        }
    }
}

export interface OnUpdate {
    onUpdate();
}