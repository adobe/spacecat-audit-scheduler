/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import wrap from '@adobe/helix-shared-wrap';
import { helixStatus } from '@adobe/helix-status';
import { Response, fetch } from '@adobe/fetch';
import secrets from '@adobe/helix-shared-secrets';

import {
  hasText,
  isValidUrl,
  resolveSecretsName,
} from '@adobe/spacecat-shared-utils';

/**
 * Validates the required environment variables.
 * @param {UniversalContext} context the context of the universal serverless function
 * @returns {boolean} true if validation is successful
 */
function validateEnv(context) {
  const { env, log } = context;

  const endpointUrl = env.AUDIT_ALL_LHS_TRIGGER_URL;
  const apiKey = env.ADMIN_KEY;

  if (!isValidUrl(endpointUrl)) {
    log.error('AUDIT_ALL_LHS_TRIGGER_URL environment variable is missing.');
    return false;
  }

  if (!hasText(apiKey)) {
    log.error('ADMIN_KEY environment variable is missing.');
    return false;
  }

  return true;
}

/**
 * This is the main function. It calls the endpoint that triggers the LHS audit of all sites.
 * It is triggered by a cron job via AWS EventBridge.
 *
 * @param {Request} request the request object
 * @param {UniversalContext} context the context of the universal serverless function
 *
 * @returns {Response} a response
 */
async function run(request, context) {
  const { log, env } = context;

  if (!validateEnv(context)) {
    return new Response('Server misconfiguration', { status: 500 });
  }

  const endpointUrl = env.AUDIT_ALL_LHS_TRIGGER_URL;
  const apiKey = env.ADMIN_KEY;

  try {
    const response = await fetch(endpointUrl, {
      method: 'GET',
      headers: { 'x-api-key': apiKey },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    log.info(`Successfully called endpoint: ${endpointUrl} with status: ${response.status}`);

    return new Response('Endpoint called successfully', { status: 200 });
  } catch (error) {
    log.error({ message: `Error calling endpoint: ${error.message}`, invokedAt: new Date().toISOString() });
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

export const main = wrap(run)
  .with(secrets, { name: resolveSecretsName })
  .with(helixStatus);
