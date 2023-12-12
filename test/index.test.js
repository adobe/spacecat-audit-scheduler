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
        TRIGGER_URLS: JSON.stringify(['http://example.com', 'http://example.org']),
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

  it('calls all endpoints successfully', async () => {
    nock('http://example.com').get('/').reply(200);
    nock('http://example.org').get('/').reply(200);

    const response = await main({ /* Request object */ }, context);
    const results = await response.json();

    expect(context.log.info.calledOnce).to.be.true;
    expect(results).to.be.an('array').that.has.lengthOf(2);
    expect(results[0].status).to.equal('Success');
    expect(results[1].status).to.equal('Success');
    expect(response.status).to.equal(200);
  });

  it('logs an error and returns a 500 response when TRIGGER_URLS is empty', async () => {
    context.env.TRIGGER_URLS = JSON.stringify([]);

    const response = await main({ /* Request object */ }, context);

    expect(context.log.error.calledOnce).to.be.true;
    expect(response.status).to.equal(500);
  });

  it('logs an error and returns a 500 response when TRIGGER_URLS is non-array', async () => {
    context.env.TRIGGER_URLS = '"http://example.com"';

    const response = await main({ /* Request object */ }, context);

    expect(context.log.error.calledOnce).to.be.true;
    expect(response.status).to.equal(500);
  });

  it('handles mixed success and failure of endpoints', async () => {
    nock('http://example.com').get('/').reply(200);
    nock('http://example.org').get('/').reply(400);

    const response = await main({ /* Request object */ }, context);
    const results = await response.json();

    expect(context.log.info.calledOnce).to.be.true;
    expect(results[0].status).to.equal('Success');
    expect(results[1].status).to.include('Failed - HTTP status: 400');
    expect(response.status).to.equal(200);
  });

  it('handles invalid JSON in TRIGGER_URLS environment variable', async () => {
    context.env.TRIGGER_URLS = 'invalid-json';

    const response = await main({ /* Request object */ }, context);

    expect(context.log.error.calledOnce).to.be.true;
    expect(response.status).to.equal(500);
  });

  it('logs an error and returns a 500 response when TRIGGER_URLS contains invalid URLs', async () => {
    context.env.TRIGGER_URLS = JSON.stringify(['http:// invalid-url']);

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

  it('handles network errors gracefully', async () => {
    nock('http://example.com').get('/').replyWithError('Network error');
    nock('http://example.org').get('/').reply(200);

    const response = await main({ /* Request object */ }, context);
    const results = await response.json();

    expect(context.log.info.calledOnce).to.be.true;
    expect(results[0].status).to.include('Failed - Error: Network error');
    expect(results[1].status).to.equal('Success');
    expect(response.status).to.equal(200);
  });
});
