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
import nock from 'nock';
import sinon from 'sinon';
import { main as lambdaFunction } from '../src/index.js';

describe('Audit Scheduler Tests', () => {
  let context;
  let log;
  let env;

  beforeEach(() => {
    log = {
      info: sinon.spy(),
      error: sinon.spy(),
      warn: sinon.spy(),
    };
    env = {
      API_AUTH_KEY: 'test-api-key',
      API_BASE_URL: 'https://example.com/api',
    };
    context = {
      invocation: {},
      log,
      env,
    };
  });

  afterEach(() => {
    nock.cleanAll();
    sinon.restore();
  });

  it('successfully makes a GET request when type is valid and not test', async () => {
    const payload = { type: 'cwv' };
    context.invocation.event = JSON.stringify(payload);
    nock(env.API_BASE_URL)
      .get(`?type=${payload.type}&url=all`)
      .reply(200);

    const response = await lambdaFunction({ /* Request options */ }, context);

    expect(response.status).to.equal(200);
    expect(log.info.calledWith('Request successful')).to.be.true;
  });

  it('successfully makes an OPTIONS request when type is test', async () => {
    const payload = { type: 'test' };
    context.invocation.event = JSON.stringify(payload);
    nock(env.API_BASE_URL)
      .options('')
      .reply(200);

    const response = await lambdaFunction({ /* Request options */ }, context);

    expect(response.status).to.equal(200);
    expect(log.info.calledWith('Request successful')).to.be.true;
  });

  it('returns 400 for invalid type', async () => {
    const payload = { type: 'invalid' };
    context.invocation.event = JSON.stringify(payload);

    const response = await lambdaFunction({ /* Request options */ }, context);

    expect(response.status).to.equal(400);
    expect(log.warn.calledWith(`Invalid type: ${payload.type}`)).to.be.true;
  });

  it('returns 400 for non-object payload', async () => {
    const payload = ['invalid'];
    context.invocation.event = JSON.stringify(payload);

    const response = await lambdaFunction({ /* Request options */ }, context);

    expect(response.status).to.equal(400);
    expect(log.error.calledWith('Invalid payload: invalid')).to.be.true;
  });

  it('returns 400 for empty payload', async () => {
    const response = await lambdaFunction({ /* Request options */ }, context);

    expect(response.status).to.equal(400);
    expect(log.warn.calledWith('Invalid type: undefined')).to.be.true;
  });

  it('should return 400 for invalid payload', async () => {
    context.invocation.event = 'invalid JSON';

    const response = await lambdaFunction({ /* Request options */ }, context);

    expect(response.status).to.equal(400);
    expect(log.error.calledWithMatch('Error parsing payload')).to.be.true;
  });

  it('should throw an error if required environment variable API_AUTH_KEY is missing', async () => {
    delete context.env.API_AUTH_KEY;
    const payload = { type: 'cwv' };
    context.invocation.event = JSON.stringify(payload);

    const response = await lambdaFunction({ /* Request options */ }, context);

    expect(response.status).to.equal(500);
    expect(log.error.calledWithMatch('Missing required environment variable: API_AUTH_KEY')).to.be.true;
  });

  it('should throw an error if required environment variable API_BASE_URL is missing', async () => {
    delete context.env.API_BASE_URL;
    const payload = { type: 'cwv' };
    context.invocation.event = JSON.stringify(payload);

    const response = await lambdaFunction({ /* Request options */ }, context);

    expect(response.status).to.equal(500);
    expect(log.error.calledWithMatch('Missing required environment variable: API_BASE_URL')).to.be.true;
  });

  it('handles fetch errors gracefully', async () => {
    const payload = { type: 'cwv' };
    context.invocation.event = JSON.stringify(payload);
    nock(env.API_BASE_URL)
      .get('')
      .query(true)
      .replyWithError('Test fetch error');

    const response = await lambdaFunction({ /* Request options */ }, context);

    expect(response.status).to.equal(500);
    expect(log.error.calledWith('Error in processing: Test fetch error')).to.be.true;
  });

  it('handles non-ok response', async () => {
    const payload = { type: 'cwv' };
    context.invocation.event = JSON.stringify(payload);
    nock(env.API_BASE_URL)
      .get('')
      .query(true)
      .reply(500, 'Test fetch error');

    const response = await lambdaFunction({ /* Request options */ }, context);

    expect(response.status).to.equal(500);
    expect(log.error.calledWith('Request failed: 500')).to.be.true;
  });
});
