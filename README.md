# SpaceCat Audit Scheduler
Below is a comprehensive README that includes details about your Lambda function and guidance on configuring an AWS EventBridge Rule to trigger it:

---

# Lambda Function for Event-Driven Processing

This project contains a Lambda function designed to be triggered by AWS EventBridge rules. The function processes events based on a given payload and interacts with an API endpoint using predefined types.

## Function Overview

The Lambda function validates and processes payloads received from EventBridge. It supports a set of predefined types and makes either a GET or OPTIONS request to a configured API endpoint based on the event's type.

### Key Features

- Payload validation and parsing.
- Dynamic request type handling (`GET` or `OPTIONS`).
- Environment-based configuration for API endpoint and authentication.
- Comprehensive error handling and logging.

## Setup and Configuration

### Prerequisites

- Node.js
- AWS CLI (configured with appropriate permissions)
- Access to an AWS account

### Deployment

1. **Deploy the Lambda Function**: Use AWS Lambda console or AWS CLI to deploy the function to your AWS environment.

2. **Set Environment Variables**: Configure `API_BASE_URL` and `API_AUTH_KEY` in the Lambda function's environment settings.

### Running Tests

Run the test suite to ensure everything is functioning correctly:

```bash
npm install
npm test
```

## AWS EventBridge Rule Configuration

To trigger this Lambda function using AWS EventBridge, you'll need to set up a rule. Below is an example CloudFormation template to configure an EventBridge rule.

### CloudFormation Template

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: "CloudFormation template for EventBridge rule 'spacecat-audit-trigger-test-dev'"

Resources:
  EventRule0:
    Type: "AWS::Events::Rule"
    Properties:
      EventBusName: "default"
      Name: "spacecat-audit-trigger-test-dev"
      ScheduleExpression: "cron(*/5 * * * ? *)"
      State: "ENABLED"
      Targets:
        - Id: "rrl0zj4vhh2w3xtvp0ke"
          Arn: "arn:aws:lambda:us-east-1:282898975672:function:spacecat-services--audit-scheduler:ci"
          Input: "{\n  \"type\": \"test\"\n}"
```

This template sets up a rule named `spacecat-audit-trigger-test-dev` that triggers every 5 minutes and invokes the specified Lambda function with a payload containing `{ "type": "test" }`.

### Deploying the Rule

To deploy this rule:

1. Save the above template to a file, e.g., `eventbridge-rule.yaml`.
2. Use the AWS CLI to deploy the template:

   ```bash
   aws cloudformation deploy --template-file eventbridge-rule.yaml --stack-name my-stack-name
   ```

3. Verify the rule in the AWS EventBridge console.

## Support and Contributions

For support, issues, or enhancements, please open an issue in the repository. Contributions to this project are welcome via pull requests.

## License
Apache-2.0
