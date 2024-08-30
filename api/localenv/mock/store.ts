import fs from "fs";

import { flattenUserData } from "@common/utils";
import { BasicUserData, UserDetails } from "@type/user";

const USER_FILE = "users.csv";

export const localSaveUserData = async (
  userData: UserDetails,
  invisibilityScore: number
) => {
  const flattenedUserData = flattenUserData(userData);

  /* Initial user creation only, setup headers */
  let headers = "";
  if (!fs.existsSync(USER_FILE)) {
    headers = Object.keys(flattenedUserData).join(",") + ",invisibilityScore\n";
  }

  /* 
    Convert data to csv format, 
      flattenUserData will have undefined or null for missing values 
      therefore still maps correctly to headers.
  */
  const csvString =
    Object.values(flattenedUserData).join(",") + "," + invisibilityScore;

  try {
    fs.appendFileSync(USER_FILE, headers + csvString + "\n");
    return true;
  } catch {
    return false;
  }
};

export const localGetUserData = async (
  userId: string
): Promise<BasicUserData | null> => {
  try {
    const users = fs.readFileSync(USER_FILE, "utf8").split("\n");

    /* Headers extracted from initial row */
    const headers = users.splice(0, 1)[0].split(",");
    const entries = users.map((userStr) => userStr.split(","));

    const foundUser = entries.find((entry) => entry[0] === userId);

    if (!foundUser) return null;

    /* Map csv data back to object using headers to define key */
    return headers.reduce(
      (acc: Record<string, string>, header: string, index: number) => {
        acc[header] = foundUser[index];
        return acc;
      },
      {}
    ) as unknown as BasicUserData;
  } catch {
    return null;
  }
};

export const localUpdateUserInvisibilityScore = async (
  userId: string,
  newScore: number
) => {
  try {
    const users = fs.readFileSync(USER_FILE, "utf8").split("\n");

    /* Headers extracted from initial row */
    const headers = users.splice(0, 1)[0].split(",");
    const entries = users.map((userStr) => userStr.split(","));

    const foundUser = entries.find((entry) => entry[0] === userId);

    if (!foundUser) return false;

    const scoreHeaderIdx = headers.findIndex(
      (header) => header === "invisibilityScore"
    );

    foundUser[scoreHeaderIdx] = newScore.toString();

    const updatedUsers = [headers.join(",")].concat(
      entries.map((entry) => entry.join(","))
    );

    fs.writeFileSync(USER_FILE, updatedUsers.join("\n"));
    return true;
  } catch {
    return false;
  }
};
