import { Logger } from '@nestjs/common';

export function LogMethod(
  level: 'log' | 'warn' | 'error' = 'log',
): MethodDecorator {
  const logger = new Logger('LogMethod');
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const className = target.constructor.name;
      const methodName = propertyKey.toString();
      const start = Date.now();
      try {
        logger[level](
          `[${className}] ${methodName} called with args: ${JSON.stringify(args)} `,
        );
        const result = await originalMethod.apply(this, args);
        const durating = Date.now() - start;
        logger[level](
          `[${className}] ${methodName} returned in${durating}: ${JSON.stringify(result)} `,
        );
      } catch (error) {
        logger.error(
          `[${className}] ${methodName} throw error: ${error.message}`,
        );
        throw error;
      }
    };
    return descriptor;
  };
}
