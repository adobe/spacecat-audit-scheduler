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

/* eslint-env mocha */

import { expect } from 'chai';
import sinon from 'sinon';
import nock from 'nock';

import { main } from '../src/index.js';

describe('Lambda Function Tests', () => {
  let context;

  beforeEach(() => {
    // Set up a fake context
    context = {
      env: {
        AUDIT_ALL_LHS_TRIGGER_URL: 'http://example.com',
        ADMIN_KEY: 'secret-api-key',
      },
      log: {
        info: sinon.spy(),
        error: sinon.spy(),
      },
    };
  });

  afterEach(() => {
    nock.cleanAll();
    sinon.restore();
  });

  it('calls the endpoint successfully', async () => {
    nock('http://example.com')
      .get('/')
      .reply(200);

    const response = await main({ /* Request object */ }, context);

    expect(context.log.info.calledOnce).to.be.true;
    expect(response.status).to.equal(200);
  });

  it('logs an error and returns a 500 response when the endpoint URL is invalid', async () => {
    context.env.AUDIT_ALL_LHS_TRIGGER_URL = 'invalid-url';

    const response = await main({ /* Request object */ }, context);

    expect(context.log.error.calledOnce).to.be.true;
    expect(response.status).to.equal(500);
  });

  it('logs an error and returns a 500 response when the API key is missing', async () => {
    delete context.env.ADMIN_KEY;

    const response = await main({ /* Request object */ }, context);

    expect(context.log.error.calledOnce).to.be.true;
    expect(response.status).to.equal(500);
  });

  it('handles fetch errors gracefully', async () => {
    nock('http://example.com')
      .get('/')
      .replyWithError('Network error');

    const response = await main({ /* Request object */ }, context);

    expect(context.log.error.calledOnce).to.be.true;
    expect(response.status).to.equal(500);
  });

  it('logs an error and returns a 500 response when the endpoint returns a non-OK response', async () => {
    nock('http://example.com')
      .get('/')
      .reply(400); // Simulating a bad request response

    const response = await main({ /* Request object */ }, context);

    expect(context.log.error.calledOnce).to.be.true;
    expect(response.status).to.equal(500);
    expect(await response.text()).to.equal('Error: HTTP error! status: 400');
  });
});
