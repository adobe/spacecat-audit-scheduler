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
import {
  context as h2,
  h1,
  createUrl,
  Response,
} from '@adobe/fetch';
import secrets from '@adobe/helix-shared-secrets';
import { isObject, resolveSecretsName } from '@adobe/spacecat-shared-utils';

const SUPPORTED_TYPES = ['cwv', '404', 'lhs', 'test'];

/* c8 ignore next 3 */
export const { fetch } = process.env.HELIX_FETCH_FORCE_HTTP1
  ? h1()
  : h2();

/**
 * Validates the type. The type must be one of the supported types.
 * @param {string} type - The type.
 * @return {boolean} - True if the type is supported, false otherwise.
 */
function validateType(type) {
  return SUPPORTED_TYPES.includes(type);
}

/**
 * Gets the event type from the event. If the event is not an object,
 * then null is returned.
 * @param {objects} event - The event from the event.
 * @param {object} log - The logger.
 * @return {string|null} - The type if the event is valid, null otherwise.
 */
function getTypeFromEvent(event, log) {
  if (!isObject(event)) {
    log.error(`Invalid payload: ${event}`);
    return null;
  }
  return event.type;
}

/**
 * Creates the request options for the fetch call. If the type is test,
 * then the request is an OPTIONS request. Otherwise, the type is appended
 * as a query parameter.
 * @param {string} type - The type of request.
 * @param {string} baseUrl - The base URL to call.
 * @return {{method: (string), url: (string)}}
 */
function createRequestOptions(type, baseUrl) {
  let url = baseUrl;
  if (type !== 'test') {
    url = `${baseUrl}?type=${type}&url=all`;
  }
  const method = type === 'test' ? 'OPTIONS' : 'GET';
  return { url, method };
}

/**
 * Fetches the data from the API.
 * @param {object} requestOptions - The request options.
 * @param {string} requestOptions.url - The URL to call.
 * @param {string} requestOptions.method - The HTTP method.
 * @param {string} apiKey - The API key.
 * @return {Promise<Response>} - The response from the API.
 */
async function fetchData(requestOptions, apiKey) {
  const { url, method } = requestOptions;

  const options = {
    method,
    headers: {
      'x-api-key': apiKey,
    },
  };

  return fetch(createUrl(url), options);
}

/**
 * Validates the required environment variables. Throws an error if any are missing.
 * @param {object} env - The environment variables.
 * @throws {Error} - If any required environment variables are missing.
 */
function validateConfiguration(env) {
  if (!env.API_AUTH_KEY) {
    throw new Error('Missing required environment variable: API_AUTH_KEY');
  }
  if (!env.API_BASE_URL) {
    throw new Error('Missing required environment variable: API_BASE_URL');
  }
}

/**
 * The main function. This is the entry point for the action.
 * It validates the configuration, parses the payload, creates the request options,
 * and fetches the data.
 * @param {Request} request - The request object.
 * @param {UniversalContext} context - The context object.
 * @return {Promise<Response>} - The response.
 */
async function run(request, context) {
  const { invocation, env, log } = context;
  const { event } = invocation;

  try {
    validateConfiguration(env);

    const type = getTypeFromEvent(event, log);
    if (!validateType(type)) {
      log.warn(`Invalid type: ${type}`);
      return new Response('Invalid type', { status: 400 });
    }

    const requestOptions = createRequestOptions(type, env.API_BASE_URL);
    const response = await fetchData(requestOptions, env.API_AUTH_KEY);
    if (!response.ok) {
      log.error(`Request failed: ${response.status}`, { statusText: response.statusText });
      return new Response('', { status: 500 });
    }

    log.info('Request successful', { type, statusCode: response.status });
    return new Response('', { status: 200 });
  } catch (error) {
    log.error(`Error in processing: ${error.message}`, error);
    return new Response('Error in processing', { status: 500 });
  }
}

export const main = wrap(run)
  .with(secrets, { name: resolveSecretsName })
  .with(helixStatus);
