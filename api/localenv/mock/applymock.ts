import proxyquire from "proxyquire";
import {
  localGetUserData,
  localSaveUserData,
  localUpdateUserInvisibilityScore,
} from "./store";

export const applyMock = (path: string) =>
  proxyquire(path, {
    "@common/store": {
      getUserData: localGetUserData,
      saveUserData: localSaveUserData,
      updateUserInvisibilityScore: localUpdateUserInvisibilityScore,
    },
  }).handler;
