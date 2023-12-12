# SpaceCat Audit Scheduler

## Overview

This enhanced Lambda function is designed to trigger LHS audits by calling multiple specified endpoints. It is scheduled to run automatically every 24 hours via AWS EventBridge. The function now supports a list of endpoint URLs provided in a JSON array through an environment variable.

## Features

- **Scheduled Invocation**: Automatically triggered every 24 hours by AWS EventBridge.
- **Multiple Endpoint Calls**: Calls multiple endpoints specified in a JSON array to trigger LHS audits.
- **Environment Variable Configuration**: Uses `TRIGGER_URLS` for a list of endpoint URLs and `ADMIN_KEY` for the API key.
- **Multi-Status Response**: Returns a detailed status for each endpoint call, indicating success or failure.

## Prerequisites

- Node.js (version as per your Lambda runtime environment)
- Access to AWS Lambda and AWS EventBridge
- Configured environment variables: `TRIGGER_URLS` (in JSON format) and `ADMIN_KEY`

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

- `TRIGGER_URLS`: A JSON string containing an array of URLs of the endpoints to trigger the LHS audits.
- `ADMIN_KEY`: The API key for authenticating requests to the endpoints.

## Testing

The tests have been updated to cover the new functionality using Mocha, Chai, and Nock. To run the tests, execute the following command:

```sh
npm test
```

Ensure that all tests pass successfully to confirm that the function behaves as expected, particularly with multiple endpoints.

## Logging

The function logs detailed information and errors using the provided logging mechanism in the AWS Lambda environment. Check the AWS CloudWatch logs for insights into the function's execution and the status of each endpoint call.

## Contributing

Contributions to this project are welcome. Please adhere to the project's coding standards and guidelines for submitting patches and additions.

## License

Apache 2.0
