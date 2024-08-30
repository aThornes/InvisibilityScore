# The Invisibility Score Service - API

The REST API provides the interface for the user to interact with the service.

## Request

The service provides a single callable HTTPS endpoint via AWS API Gateway to be consumed. No API Key is neccessary but the request must contain an authorisation header with the user's cognito token.

The details of this endpoint can be found in the openapi documentation [here](docs/openApi.yaml)

## Local

The service can be ran locally for testing using an express environment. Any AWS functions are mocked via the proxyquire package. These are applied in [applymock](/api/localenv/mock/applymock.ts)

To run this environment ensure you have created your `.env` file, installed dependices via `yarn`/`yarn install`. Then run

`yarn local`

This will run the express server API on port 8080.
