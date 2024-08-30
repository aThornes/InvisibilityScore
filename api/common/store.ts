import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { getEnvVariable } from "./environment";
import { UserDetails, BasicUserData } from "@type/user";
import { flattenUserData } from "./utils";

export const saveUserData = async (
  userData: UserDetails,
  invisibilityScore: number
) => {
  try {
    const client = new DynamoDBClient({});
    const dynamoDB = DynamoDBDocumentClient.from(client);

    const flattenedUserData = flattenUserData(userData);

    const params = {
      TableName: getEnvVariable("USER_TABLE"),
      Item: { flattenedUserData, invisibilityScore },
    };

    const putCommand = new PutCommand(params);
    const response = await dynamoDB.send(putCommand);
    return response.$metadata.httpStatusCode === 200;
  } catch (error) {
    console.error("Error storing data in DynamoDB:", error);
    return false;
  }
};

export const getUserData = async (
  userId: string
): Promise<BasicUserData | null> => {
  try {
    const client = new DynamoDBClient({});
    const dynamoDB = DynamoDBDocumentClient.from(client);

    const params = {
      TableName: getEnvVariable("USER_TABLE"),
      Key: {
        userId,
      },
    };

    const getCommand = new GetCommand(params);
    const response = await dynamoDB.send(getCommand);
    return response.Item as BasicUserData;
  } catch (error) {
    return null;
  }
};

export const updateUserInvisibilityScore = async (
  userId: string,
  newScore: number
) => {
  try {
    const client = new DynamoDBClient({});
    const dynamoDB = DynamoDBDocumentClient.from(client);

    const params = {
      TableName: getEnvVariable("USER_TABLE"),
      Key: {
        userId,
      },
      UpdateExpression: "SET invisibilityScore = :newScore",
      ExpressionAttributeValues: {
        ":newScore": newScore,
      },
    };

    const updateCommand = new UpdateCommand(params);
    const response = await dynamoDB.send(updateCommand);
    return !!response.Attributes;
  } catch (error) {
    console.error("Error updating data in DynamoDB:", error);
    return false;
  }
};
