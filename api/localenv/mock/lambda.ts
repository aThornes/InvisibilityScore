import { APIGatewayProxyHandler } from "aws-lambda";
import { getContext, getEventFromRequest } from "./event";

export const runLambda = async ({
  lambdaFn,
  res,
  req,
}: {
  lambdaFn: APIGatewayProxyHandler;
  res: import("express").Response;
  req: import("express").Request;
}) => {
  try {
    const event = getEventFromRequest(req);
    const context = getContext();

    const response = await lambdaFn(event, context, () => null);
    res.status(200).send(response);
  } catch (e) {
    console.error(e);
    if (e) throw new Error(e.toString());
    throw new Error("Unknown error");
  }
};
