import { APIGatewayProxyHandler } from "aws-lambda";
import { Method } from "aws-sdk/clients/lambda";

import { LambdaResponder } from "@common/responder";

import acceptSchema from "./acceptSchema.json";
import responseSchema from "./responseSchema.json";
import { retrieveUserDetails } from "@common/api";
import { calculateInvisibilityScore } from "@common/utils";
import {
  getUserData,
  saveUserData,
  updateUserInvisibilityScore,
} from "@common/store";

const methods: Method[] = ["GET"];

interface Body {
  superheroScore: number;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const responder = new LambdaResponder<Body>({
    event,
    methods,
    acceptSchema,
    responseSchema,
  });

  if (!responder.passChecks)
    return responder.errorResponse(
      responder.failStatus || 500,
      responder.failMessage || ""
    );

  const userId = responder.event.requestContext.authorizer?.jwt?.claims?.sub;
  if (!userId) return responder.errorResponse(500, "Unable to validate user");

  /* Retrieve user details */
  const userDetails = await retrieveUserDetails(userId);

  if (!userDetails)
    return responder.errorResponse(500, "Unable to retrieve user details");

  const { superheroScore } = responder.body;

  /* Calculate invisibility score */
  const invisibilityScore = calculateInvisibilityScore({
    isMale: userDetails.gender.toLowerCase() === "male",
    superheroScore,
    age: userDetails.dob.age,
  });

  /* Update/Append user store */
  const loginId = userDetails.login.uuid;
  const foundUser = await getUserData(loginId);

  let success = false;
  if (foundUser) {
    success = await updateUserInvisibilityScore(loginId, invisibilityScore);
  } else {
    success = await saveUserData(userDetails, invisibilityScore);
  }

  return responder.successResponse(200, { invisibilityScore, saved: success });
};
