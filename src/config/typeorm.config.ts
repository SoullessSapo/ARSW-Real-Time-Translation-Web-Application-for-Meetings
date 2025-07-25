// typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => {
  // Log de todas las variables de entorno relevantes para la DB
  console.log('[TYPEORM ENV]', {
    DB_HOST: config.get<string>('DB_HOST'),
    DB_PORT: config.get<string>('DB_PORT'),
    DB_USERNAME: config.get<string>('DB_USERNAME'),
    DB_PASSWORD: config.get<string>('DB_PASSWORD'),
    DB_DATABASE: config.get<string>('DB_DATABASE'),
    DB_SSL: config.get<string>('DB_SSL'),
  });
  // Si algún día quisieras desactivarlo (por ejemplo, en tu PC local),
  // pondrías DB_SSL=false en tu .env. Pero por defecto siempre es true.
  const sslEnabled = config.get<string>('DB_SSL', 'true') !== 'false';

  return {
    type: 'postgres',
    host: config.get<string>('DB_HOST'),
    port: parseInt(config.get<string>('DB_PORT') ?? '5432', 10),
    username: config.get<string>('DB_USERNAME'),
    password: config.get<string>('DB_PASSWORD'),
    database: config.get<string>('DB_DATABASE'),
    autoLoadEntities: true,
    synchronize: false,
    // <-- Siempre habilitado
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    extra: sslEnabled ? { ssl: { rejectUnauthorized: false } } : {},
  };
};
