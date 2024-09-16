import { plainToInstance } from 'class-transformer';
import { IsString, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @Min(0)
  GOOGLE_CLIENT_ID: string;

  @IsString()
  @Min(0)
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  @Min(0)
  GOOGLE_REDIRECT_URI: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
