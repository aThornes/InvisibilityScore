import proxyquire from "proxyquire";
import {
  localGetUserData,
  localSaveUserData,
  localUpdateUserInvisibilityScore,
} from "./store";

class clientDynamoMock {
  constructor() {}
}

const libDynamoMock = {
  DynamoDBDocumentClient: {
    from: () => ({
      send: (callback: any) => {
        return callback();
      },
    }),
  },
  GetCommand: class {
    constructor() {
      return console.log;
    }
  },
  PutCommand: class {
    constructor() {
      return console.log;
    }
  },
  UpdateCommand: class {
    constructor() {
      return console.log;
    }
  },
};

export const applyMock = (path: string) =>
  proxyquire(path, {
    "@aws-sdk/client-dynamodb": { DynamoDBClient: clientDynamoMock },
    "@aws-sdk/lib-dynamodb": libDynamoMock,
    "@common/store": {
      getUserData: localGetUserData,
      saveUserData: localSaveUserData,
      updateUserInvisibilityScore: localUpdateUserInvisibilityScore,
    },
  }).handler;
