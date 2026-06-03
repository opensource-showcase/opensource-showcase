/**
 * Configuration management utilities
 */

import Conf from 'conf';
import { readFile, writeFile, access } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';
import { APP_NAME, CONFIG_FILE_NAME, DEFAULT_CONFIG } from '../constants.js';
import type { UserConfig } from '../types/index.js';
import { ConfigurationError } from './errors.js';

// Persistent storage for auth tokens and cache
export const store = new Conf({
  projectName: APP_NAME,
});

/**
 * Get user configuration from ~/.opensourcerc
 * Falls back to defaults if file doesn't exist
 */
export async function getUserConfig(): Promise<UserConfig> {
  const configPath = join(homedir(), CONFIG_FILE_NAME);

  try {
    await access(configPath);
    const content = await readFile(configPath, 'utf-8');
    const userConfig = JSON.parse(content) as Partial<UserConfig>;

    // Validate and merge with defaults
    return {
      ...DEFAULT_CONFIG,
      ...userConfig,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, return defaults
      return DEFAULT_CONFIG;
    }
    if (error instanceof SyntaxError) {
      throw new ConfigurationError(`Invalid JSON in ${CONFIG_FILE_NAME}: ${error.message}`);
    }
    throw new ConfigurationError(`Failed to read config: ${(error as Error).message}`);
  }
}

/**
 * Save user configuration to ~/.opensourcerc
 */
export async function saveUserConfig(config: Partial<UserConfig>): Promise<UserConfig> {
  const configPath = join(homedir(), CONFIG_FILE_NAME);
  const mergedConfig: UserConfig = { ...DEFAULT_CONFIG, ...config };

  try {
    await writeFile(configPath, JSON.stringify(mergedConfig, null, 2), 'utf-8');
    return mergedConfig;
  } catch (error) {
    throw new ConfigurationError(`Failed to save config: ${(error as Error).message}`);
  }
}

/**
 * Check if config file exists
 */
export async function configExists(): Promise<boolean> {
  const configPath = join(homedir(), CONFIG_FILE_NAME);
  try {
    await access(configPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get stored GitHub token
 */
export function getStoredToken(): string | undefined {
  return store.get('github_token') as string | undefined;
}

/**
 * Store GitHub token securely
 */
export function storeToken(token: string): void {
  store.set('github_token', token);
}

/**
 * Clear stored token
 */
export function clearToken(): void {
  store.delete('github_token');
}

/**
 * Get stored username
 */
export function getStoredUsername(): string | undefined {
  return store.get('github_username') as string | undefined;
}

/**
 * Store GitHub username
 */
export function storeUsername(username: string): void {
  store.set('github_username', username);
}

/**
 * Get stored user data
 */
export function getStoredUser(): Record<string, unknown> | undefined {
  return store.get('github_user') as Record<string, unknown> | undefined;
}

/**
 * Store GitHub user data
 */
export function storeUser(user: Record<string, unknown>): void {
  store.set('github_user', user);
}

/**
 * Clear all stored data
 */
export function clearAllData(): void {
  store.clear();
}

/**
 * Get cache entry
 */
export function getCacheEntry<T>(key: string): T | undefined {
  return store.get(`cache.${key}`) as T | undefined;
}

/**
 * Set cache entry with optional TTL
 */
export function setCacheEntry<T>(key: string, value: T, ttlMs?: number): void {
  const entry = {
    value,
    timestamp: Date.now(),
    ttl: ttlMs,
  };
  store.set(`cache.${key}`, entry);
}

/**
 * Check if cache entry is valid (not expired)
 */
export function isCacheValid(key: string): boolean {
  const entry = store.get(`cache.${key}`) as
    | { timestamp: number; ttl?: number }
    | undefined;

  if (!entry) {
    return false;
  }

  if (!entry.ttl) {
    return true; // No TTL = never expires
  }

  return Date.now() - entry.timestamp < entry.ttl;
}

/**
 * Clear specific cache entry
 */
export function clearCacheEntry(key: string): void {
  store.delete(`cache.${key}`);
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  const keys = [...store];
  keys.forEach(([key]) => {
    if (key.startsWith('cache.')) {
      store.delete(key);
    }
  });
}
