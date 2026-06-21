/**
 * Validate command: validate contributions.json schema
 */

import { readFile } from 'fs/promises';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { validateContributionsSchema } from '../repo/manage-repo.js';
import { ValidationError } from '../utils/errors.js';
import { SPEC_VERSION } from '../constants.js';
import type { ContributionsData, EnrichedContribution } from '../types/index.js';

export async function validateCommand(filePath: string): Promise<void> {
  logger.title('✓ Validating contributions.json');
  logger.newline();

  logger.info(`Reading file: ${filePath}`);

  try {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as unknown;

    // Validate schema
    validateContributionsSchema(data);

    // Now we can safely assert the type
    const validData = data as ContributionsData;

    logger.success('Schema validation passed');
    logger.newline();

    // Show details
    logger.subtitle('File Details');
    logger.keyValue('Version', validData.version);
    logger.keyValue('Contributor', validData.contributor.username);
    logger.keyValue('Contributions', validData.contributions.length.toString());
    logger.keyValue('Last Updated', new Date(validData.updated_at).toLocaleString());

    // Check version compatibility
    if (validData.version !== SPEC_VERSION) {
      logger.newline();
      logger.warning(`Version mismatch: Expected ${SPEC_VERSION}, found ${validData.version}`);
      logger.info('This file may use an older or newer specification version');
    }

    // Validate each contribution
    logger.newline();
    logger.subtitle('Contribution Validation');

    const issues: string[] = [];

    validData.contributions.forEach((c: EnrichedContribution, index: number) => {
      // Check required fields
      if (!c.repo || !c.pr_number || !c.pr_title || !c.pr_url || !c.merged_at) {
        issues.push(`Contribution ${index + 1}: Missing required field(s)`);
      }

      // Check repo format
      if (c.repo && !c.repo.includes('/')) {
        issues.push(`Contribution ${index + 1}: Invalid repo format (should be owner/repo)`);
      }

      // Check URL format
      if (c.pr_url && !c.pr_url.startsWith('https://github.com/')) {
        issues.push(`Contribution ${index + 1}: Invalid PR URL format`);
      }

      // Check date format
      if (c.merged_at && isNaN(Date.parse(c.merged_at))) {
        issues.push(`Contribution ${index + 1}: Invalid date format`);
      }
    });

    if (issues.length === 0) {
      logger.success('All contributions are valid');
    } else {
      logger.warning(`Found ${issues.length} issue(s):`);
      logger.newline();
      issues.forEach((issue) => {
        logger.listItem(chalk.yellow(issue));
      });
    }

    logger.newline();
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      throw new ValidationError('Invalid JSON syntax');
    }

    if (error instanceof ValidationError) {
      throw error;
    }

    if ((error as { code?: string }).code === 'ENOENT') {
      throw new ValidationError(`File not found: ${filePath}`);
    }

    throw new ValidationError(`Validation failed: ${(error as Error).message}`);
  }
}
