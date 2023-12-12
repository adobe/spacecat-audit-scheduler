# SpaceCat Audit Scheduler

## Overview

This Lambda function is designed to trigger LHS audits by calling a specified endpoint. It is scheduled to run automatically every 24 hours via AWS EventBridge. The function uses environment variables to retrieve the endpoint URL and the necessary authentication key.

## Features

- **Scheduled Invocation**: Automatically triggered every 24 hours by AWS EventBridge.
- **Endpoint Call**: Calls a specified endpoint to trigger an LHS audit.
- **Environment Variable Configuration**: Uses `AUDIT_ALL_LHS_TRIGGER_URL` for the endpoint URL and `ADMIN_KEY` for the API key.

## Prerequisites

- Node.js (version as per your Lambda runtime environment)
- Access to AWS Lambda and AWS EventBridge
- Configured environment variables: `AUDIT_ALL_LHS_TRIGGER_URL` and `ADMIN_KEY`

## Installation

1. **Clone the repository:**

   ```sh
   git clone [repository-url]
   cd [repository-directory]
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Deploy to AWS Lambda:**

   Use `npm run deploy` to deploy the function to AWS Lambda.

4. **Configure AWS EventBridge:**

   Set up a rule to trigger this Lambda function every 24 hours.

## Usage

The Lambda function will run automatically based on the schedule set in AWS EventBridge. It does not require manual intervention unless there is a need to update the environment variables or the function code.

## Environment Variables

- `AUDIT_ALL_LHS_TRIGGER_URL`: The URL of the endpoint to trigger the LHS audits.
- `ADMIN_KEY`: The API key for authenticating the request to the endpoint.

## Testing

Tests have been written using Mocha, Chai, and Nock. To run the tests, execute the following command:

```sh
npm test
```

Ensure that all tests pass successfully to confirm that the function behaves as expected.

## Logging

The function logs information and errors using the provided logging mechanism in the AWS Lambda environment. Check the AWS CloudWatch logs for insights into the function's execution.

## Contributing

Contributions to this project are welcome. Please follow the project's coding standards and guidelines for submitting patches and additions.

## License

Apache 2.0
