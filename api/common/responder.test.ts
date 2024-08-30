import { APIGatewayProxyEvent } from "aws-lambda";
import { Method } from "aws-sdk/clients/lambda";
import { Schema } from "jsonschema";

import { LambdaResponder } from "./responder";
import { getEnvVariable } from "./environment";

import {
  INVALID_ORIGIN,
  getAcceptSchemaError,
  getResponseSchemaError,
} from "./messages";

jest.mock("./environment");
jest.mock("./messages");

describe("LambdaResponder", () => {
  const mockEvent: APIGatewayProxyEvent = {
    body: JSON.stringify({ key: "value" }),
    headers: { origin: "http://example.com" },
    httpMethod: "POST",
    isBase64Encoded: false,
    multiValueHeaders: {},
    path: "/test",
    pathParameters: {},
    queryStringParameters: {},
    multiValueQueryStringParameters: {},
    requestContext: {} as any,
    resource: "",
    stageVariables: {},
  };

  const mockMethods: Method[] = ["POST"];
  const mockSchema: Schema = {
    type: "object",
    properties: {
      key: { type: "string" },
    },
    required: ["key"],
  };

  beforeEach(() => {
    (getEnvVariable as jest.Mock).mockReturnValue("http://example.com");
    (getAcceptSchemaError as jest.Mock).mockReturnValue(
      "Schema validation error"
    );
    (getResponseSchemaError as jest.Mock).mockReturnValue(
      "Response schema validation error"
    );
  });

  it("should pass checks with valid schema and origin", () => {
    const responder = new LambdaResponder({
      event: mockEvent,
      methods: mockMethods,
      acceptSchema: mockSchema,
    });

    expect(responder.passChecks).toBe(true);
  });

  it("should fail checks with invalid schema", () => {
    const invalidEvent = {
      ...mockEvent,
      body: JSON.stringify({ invalidKey: "value" }),
    };
    const responder = new LambdaResponder({
      event: invalidEvent,
      methods: mockMethods,
      acceptSchema: mockSchema,
    });

    expect(responder.passChecks).toBe(false);
    expect(responder.failStatus).toBe(400);
    expect(responder.failMessage).toBe("Schema validation error");
  });

  it("should fail checks with invalid origin", () => {
    (getEnvVariable as jest.Mock).mockReturnValue("http://another-origin.com");

    const responder = new LambdaResponder({
      event: mockEvent,
      methods: mockMethods,
      acceptSchema: mockSchema,
    });

    expect(responder.passChecks).toBe(false);
    expect(responder.failStatus).toBe(403);
    expect(responder.failMessage).toBe(INVALID_ORIGIN);
  });

  it("should return success response with valid schema", () => {
    const responder = new LambdaResponder({
      event: mockEvent,
      methods: mockMethods,
      acceptSchema: mockSchema,
      responseSchema: mockSchema,
    });

    const response = responder.successResponse(200, { key: "value" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(JSON.stringify({ key: "value" }));
  });

  it("should return error response", () => {
    const responder = new LambdaResponder({
      event: mockEvent,
      methods: mockMethods,
      acceptSchema: mockSchema,
    });

    const response = responder.errorResponse(500, "Internal Server Error");

    expect(response.statusCode).toBe(500);
    expect(response.body).toBe(
      JSON.stringify({ error: "Internal Server Error" })
    );
  });

  it("should return bad origin response if checks fail", () => {
    (getEnvVariable as jest.Mock).mockReturnValue("http://another-origin.com");

    const responder = new LambdaResponder({
      event: mockEvent,
      methods: mockMethods,
      acceptSchema: mockSchema,
    });

    const response = responder.successResponse(200, { key: "value" });

    expect(response.statusCode).toBe(400);
    expect(response.body).toBe(
      JSON.stringify({ error: "Request blocked. Invalid Origin" })
    );
  });
});
