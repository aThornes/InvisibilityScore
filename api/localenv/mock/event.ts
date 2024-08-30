import { APIGatewayProxyEvent, APIGatewayProxyEventHeaders } from "aws-lambda";

type AnyStringObject = { [key: string]: string };
type AnyStringObjectArray = { [key: string]: string[] };

export const getEventFromRequest = (
  req: import("express").Request
): APIGatewayProxyEvent => {
  const requestContext: any = { authorizer: {} };

  /* Mock lambda authoriser context */
  if (req.headers.authorization) {
    requestContext.authorizer = {
      jwt: {
        claims: {
          sub: req.headers.authorization,
        },
      },
    };
  }

  return {
    body: JSON.stringify(req.body),
    headers: req.headers as APIGatewayProxyEventHeaders,
    httpMethod: req.method,
    isBase64Encoded: false,
    multiValueHeaders: req.headers as AnyStringObjectArray,
    path: req.path,
    pathParameters: req.params,
    queryStringParameters: req.query as AnyStringObject,
    multiValueQueryStringParameters: req.query as AnyStringObjectArray,
    requestContext,
    stageVariables: {},
    resource: "",
  };
};

export const getContext = () => ({} as any);
