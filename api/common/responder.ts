import { APIGatewayProxyEvent } from "aws-lambda";
import { Method } from "aws-sdk/clients/lambda";
import { Schema, validate } from "jsonschema";
import { getEnvVariable } from "./environment";
import {
  INVALID_ORIGIN,
  getAcceptSchemaError,
  getResponseSchemaError,
} from "./messages";

const parseBody = (body: string) => {
  if (typeof body === "object") return body;
  try {
    const jsonBody = JSON.parse(body);
    return jsonBody;
  } catch {
    return {};
  }
};

const checkSchema = (body: Record<string, any>, schema?: Schema) => {
  if (schema) {
    const validationResult = validate(body, schema);
    if (validationResult.valid) return true;
    // console.error("Schema validation failed:", validationResult.errors);
    return false;
  }
  return true;
};

export class LambdaResponder<T> {
  readonly event: APIGatewayProxyEvent;
  readonly body: T;
  readonly origin: string;
  readonly methods: Method[];
  readonly responseSchema: Schema | undefined;

  passChecks: boolean;
  failMessage?: string;
  failStatus?: number;

  constructor({
    event,
    methods,
    responseSchema,
    acceptSchema,
  }: {
    event: APIGatewayProxyEvent;
    methods: Method[];
    acceptSchema?: Schema;
    responseSchema?: Schema;
  }) {
    /* Default to true */
    this.passChecks = true;

    this.event = event;
    this.methods = methods;

    this.origin = event.headers["Origin"] || event.headers["origin"] || "";
    this.responseSchema = responseSchema;

    /* Handle accept schema check - request is rejected should this fail */
    const body = parseBody(event.body || "");
    this.body = body;
    const passSchema = checkSchema(body, acceptSchema);

    if (!passSchema) {
      this.passChecks = false;
      this.failStatus = 400;
      this.failMessage = getAcceptSchemaError(event.path);
      return;
    }

    this.checkOrigin();
  }

  /* Check request passes allowed origin (CORS) check */
  private checkOrigin = () => {
    const allowedOrigin = getEnvVariable("ALLOWED_ORIGIN");
    const originList = allowedOrigin.split(",").map((o) => o.trim());

    const success = originList.includes(this.origin);

    if (!success) {
      this.passChecks = false;
      this.failStatus = 403;
      this.failMessage = INVALID_ORIGIN;
    }
  };

  private getHeaders = () => {
    const responseHeaders: Record<string, string> = {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": ["OPTIONS", ...this.methods].join(","),
    };
    if (this.origin)
      responseHeaders["Access-Control-Allow-Origin"] = this.origin;
    return responseHeaders;
  };

  private badOriginResponse = () => {
    return {
      statusCode: 400,
      headers: this.getHeaders(),
      body: JSON.stringify({ error: "Request blocked. Invalid Origin" }),
    };
  };

  private getLogPrefix = (level: string) =>
    `[${level}] ${this.event.httpMethod.toUpperCase()} - ${this.event.path}:`;

  successResponse = (
    status: number,
    body: string | Record<string, any>,
    headers?: Record<string, string>
  ) => {
    if (!this.passChecks) {
      console.error(
        this.getLogPrefix("ERROR"),
        "Request blocked. Invalid Origin"
      );
      return this.badOriginResponse();
    }

    /* Schema check on response object */
    if (typeof body === "object" && !checkSchema(body, this.responseSchema)) {
      console.error(
        this.getLogPrefix("ERROR"),
        "Response schema validation failed"
      );
      return {
        statusCode: 400,
        headers: this.getHeaders(),
        body: JSON.stringify({
          error: getResponseSchemaError(this.event.path),
        }),
      };
    }

    const responseHeaders = headers
      ? { ...this.getHeaders(), ...headers }
      : this.getHeaders();

    const respBody = typeof body === "object" ? JSON.stringify(body) : body;

    console.log(this.getLogPrefix("INFO"), `Status: ${status}`);
    return { statusCode: status, headers: responseHeaders, body: respBody };
  };

  errorResponse = (status: number, error: string) => {
    console.log(
      `[INFO] ${this.event.httpMethod.toUpperCase()} - ${
        this.event.path
      }: Status: ${status} - Error: ${error}`
    );
    return {
      statusCode: status,
      headers: this.getHeaders(),
      body: JSON.stringify({ error }),
    };
  };
}
