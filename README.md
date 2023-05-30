# AWS Lambda Service for Hospital and Pharmacy Information
This is a simple AWS Lambda function that connects to a MySQL database, executes queries based on request, and returns the results as a response. The function is used to manage hospital and pharmacy information.

## Project structure
- index.ts: This is the entry point of our Lambda function. It handles incoming events and executes appropriate operations based on the HTTP method of the request.
- util.ts: This is a utility module that includes a helper function queryMySQL for executing MySQL queries.
- .github/workflows/main.yml: This is the GitHub Actions workflow file. It defines a pipeline for building, zipping, and deploying our Lambda function to AWS whenever we push to the main branch.

## Getting Started
Follow these steps to deploy the Lambda function:

- Clone the repository.
- Install dependencies with npm.
```
npm ci
```
- Build the project and create a deployable zip file.
```
npx ncc build index.ts
zip -j deploy.zip ./dist/*
```
- Deploy the Lambda function using AWS CLI.
```
aws lambda update-function-code --function-name functionName --zip-file fileb://deploy.zip
aws lambda publish-version --function-name functionName
```

## Environment Variables
The function requires the following environment variables:

- alias_DB_HOST: The host of the MySQL database. <alias> can be either 'DEV' or 'PROD'.
- alias_DB_USER: The user of the MySQL database.
- alias_DB_PASSWORD: The password of the MySQL database.
- alias_DB_NAME: The name of the MySQL database.

You can set these variables in the AWS Lambda function configuration.

## GitHub Actions

The included GitHub Actions workflow will automatically build and deploy the Lambda function when changes are pushed to the main branch. To use this workflow, you need to add the following secrets to your repository:

- AWS_ACCESS_KEY_ID: Your AWS access key.
- AWS_SECRET_ACCESS_KEY: Your AWS secret access key.

## Endpoints
### GET
You can get information about hospitals or pharmacies by sending a GET request to the Lambda function.

Query parameters:
- id: Get a specific item by its ID.
- sidoNm: Get items from a specific province.
- sigunNm: Get items from a specific city or county.
- dongNm: Get items from a specific neighborhood.
  
### POST
(To be implemented) Update or create hospital/pharmacy information.

## Limitations and Future Work
As of now, this Lambda function only supports GET requests. Support for POST requests to update or create new entries in the database is planned for a future update.

