import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { handler } from "./handler";
import { retrieveUserDetails } from "@common/api";
import {
  getUserData,
  saveUserData,
  updateUserInvisibilityScore,
} from "@common/store";
import { calculateInvisibilityScore } from "@common/utils";

jest.mock("@common/api");
jest.mock("@common/store");
jest.mock("@common/utils");

const mockRetrieveUserDetails = retrieveUserDetails as jest.Mock;
const mockGetUserData = getUserData as jest.Mock;
const mockSaveUserData = saveUserData as jest.Mock;
const mockUpdateUserInvisibilityScore =
  updateUserInvisibilityScore as jest.Mock;
const mockCalculateInvisibilityScore = calculateInvisibilityScore as jest.Mock;

describe("handler", () => {
  const mockEvent = {
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:3000",
      Authorisation: "token",
    },
    path: "/invisibility-score",
    httpMethod: "get",
    requestContext: {
      authorizer: {
        jwt: {
          claims: {
            sub: "user-id-123",
          },
        },
      },
    },
    body: JSON.stringify({ superheroScore: 50 }),
  } as unknown as APIGatewayProxyEvent;

  const mockContext = {} as Context;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should be successful on valid request for update", async () => {
    mockRetrieveUserDetails.mockResolvedValue({
      gender: "male",
      dob: { age: 30 },
      login: { uuid: "login-id-123" },
    });
    mockGetUserData.mockResolvedValue({
      gender: "male",
      dob: { age: 30 },
      login: { uuid: "login-id-123" },
    });
    mockUpdateUserInvisibilityScore.mockResolvedValue(true);
    mockSaveUserData.mockResolvedValue(false);
    mockCalculateInvisibilityScore.mockReturnValue(75);

    const result = await handler(mockEvent, mockContext, () => {});

    expect(result).toBeDefined();
    if (!result) return;

    expect(result.statusCode).toBe(200);

    const jsonBody = JSON.parse(result.body);

    expect(jsonBody.saved).toBe(true);
    expect(jsonBody.invisibilityScore).toBeDefined();
  });

  it("should be successful on valid request for new record", async () => {
    mockRetrieveUserDetails.mockResolvedValue({
      gender: "male",
      dob: { age: 30 },
      login: { uuid: "login-id-123" },
    });
    mockGetUserData.mockResolvedValue(null);
    mockUpdateUserInvisibilityScore.mockResolvedValue(false);
    mockSaveUserData.mockResolvedValue(true);
    mockCalculateInvisibilityScore.mockReturnValue(75);

    const result = await handler(mockEvent, mockContext, () => {});

    expect(result).toBeDefined();
    if (!result) return;

    expect(result.statusCode).toBe(200);

    const jsonBody = JSON.parse(result.body);

    expect(jsonBody.saved).toBe(true);
    expect(jsonBody.invisibilityScore).toBeDefined();
  });

  it("should reject if missing claims", async () => {
    const event = {
      ...mockEvent,
      requestContext: {
        authorizer: {
          jwt: {
            claims: {},
          },
        },
      },
    } as unknown as APIGatewayProxyEvent;

    const result = await handler(event, mockContext, () => {});

    expect(result).toBeDefined();
    if (!result) return;

    expect(result.statusCode).toBe(500);
  });

  it("should reject if no user details are found", async () => {
    mockRetrieveUserDetails.mockResolvedValue(null);

    const result = await handler(mockEvent, mockContext, () => {});

    expect(result).toBeDefined();
    if (!result) return;

    expect(result.statusCode).toBe(500);
  });
});
