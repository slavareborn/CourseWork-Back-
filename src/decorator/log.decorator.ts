import { Logger } from '@nestjs/common';
import { Response } from 'express';

const safeStringify = (obj: any): string => {
  if (obj instanceof Response) {
    return '[Express Response]';
  }

  try {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
  } catch (error) {
    return '[Complex Object]';
  }
};

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
          `[${className}] ${methodName} called with args: ${safeStringify(args)}`,
        );
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - start;
        logger[level](
          `[${className}] ${methodName} returned in ${duration}ms: ${safeStringify(result)}`,
        );
        return result;
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
