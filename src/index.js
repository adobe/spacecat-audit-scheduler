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
import { Response } from '@adobe/fetch';
import secrets from '@adobe/helix-shared-secrets';
import { resolveSecretsName } from '@adobe/spacecat-shared-utils';

/**
 * This is the main function
 * @param {Request} request the request object
 * @param {UniversalContext} context the context of the universal serverless function
 * @returns {Response} a response
 */
async function run(request, context) {
  const { log } = context;
  log.info('Hello World');
  return new Response('', { status: 200 });
}

export const main = wrap(run)
  .with(secrets, { name: resolveSecretsName })
  .with(helixStatus);
