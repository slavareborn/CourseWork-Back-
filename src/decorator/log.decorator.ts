import { Logger } from '@nestjs/common';

function safeStringify(obj: any): string {
  if (obj === null || obj === undefined) {
    return String(obj);
  }

  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular]';
      }
      cache.add(value);
    }
    if (value instanceof Response || value instanceof Request) {
      return `[${value.constructor.name}]`;
    }
    return value;
  });
}

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
          `[Custom Logger] 🚀 ${className}.${methodName} викликано з аргументами: ${safeStringify(args)} `,
        );
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - start;
        logger[level](
          `[Custom Logger] ✅ ${className}.${methodName} виконано за ${duration}ms. Результат: ${safeStringify(result)} `,
        );
        return result;
      } catch (error) {
        logger.error(
          `[Custom Logger] ❌ ${className}.${methodName} помилка: ${error.message}`,
        );
        throw error;
      }
    };
    return descriptor;
  };
}
