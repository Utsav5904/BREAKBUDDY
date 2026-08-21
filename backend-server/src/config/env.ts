import dotenv from 'dotenv';

dotenv.config();

export interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production';
  GEMINI_API_KEY: string | undefined;
  APP_URL: string | undefined;
}

function loadEnv(): EnvConfig {
  const port = parseInt(process.env.PORT || '3000', 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    console.warn(`[env] Invalid PORT "${process.env.PORT}", defaulting to 3000`);
  }

  const nodeEnv = process.env.NODE_ENV === 'development' ? 'development' : 'production';
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const appUrl = process.env.APP_URL;

  // Log configuration status (no secrets)
  console.log(`[env] NODE_ENV: ${nodeEnv}`);
  console.log(`[env] PORT: ${isNaN(port) ? 3000 : port}`);
  console.log(`[env] GEMINI_API_KEY: ${geminiApiKey ? 'configured' : 'NOT SET — AI features disabled'}`);
  console.log(`[env] APP_URL: ${appUrl || 'not set'}`);

  return {
    PORT: isNaN(port) ? 3000 : port,
    NODE_ENV: nodeEnv,
    GEMINI_API_KEY: geminiApiKey,
    APP_URL: appUrl,
  };
}

export const env = loadEnv();
