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
 * Parses and validates the TRIGGER_URLS environment variable.
 * @param {UniversalContext} context the context of the universal serverless function
 * @returns {string[]} Array of valid URLs if parsing and validation are successful, otherwise null
 */
function parseAndValidateTriggerUrls(context) {
  const { env, log } = context;
  let urls;

  try {
    urls = JSON.parse(env.TRIGGER_URLS);
  } catch (error) {
    log.error('Error parsing TRIGGER_URLS: Invalid JSON format.');
    return null;
  }

  if (!Array.isArray(urls) || urls.length === 0) {
    log.error('TRIGGER_URLS environment variable does not contain a valid array of URLs.');
    return null;
  }

  if (urls.some((url) => !isValidUrl(url))) {
    log.error('One or more URLs in TRIGGER_URLS are invalid.');
    return null;
  }

  return urls;
}

/**
 * Main Lambda function to trigger audits on multiple URLs.
 * @param {Request} request the request object
 * @param {UniversalContext} context the context of the universal serverless function
 * @returns {Response} a response
 */
async function run(request, context) {
  const { log, env } = context;

  const triggerUrls = parseAndValidateTriggerUrls(context);
  if (!triggerUrls) {
    return new Response('Error in TRIGGER_URLS configuration', { status: 500 });
  }

  const apiKey = env.ADMIN_KEY;
  if (!hasText(apiKey)) {
    log.error('ADMIN_KEY environment variable is missing.');
    return new Response('Missing ADMIN_KEY', { status: 500 });
  }

  const fetchPromises = triggerUrls.map((url) => fetch(url, {
    method: 'GET',
    headers: { 'x-api-key': apiKey },
  }).then((response) => ({
    url,
    status: response.ok ? 'Success' : `Failed - HTTP status: ${response.status}`,
  })).catch((error) => ({
    url,
    status: `Failed - Error: ${error.message}`,
  })));

  const results = await Promise.all(fetchPromises);

  log.info('Endpoint call results:', results);
  return new Response(JSON.stringify(results), { status: 200 });
}

export const main = wrap(run)
  .with(secrets, { name: resolveSecretsName })
  .with(helixStatus);
