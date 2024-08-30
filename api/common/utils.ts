import { BasicUserData, UserDetails } from "@type/user";
import { getEnvVariable } from "./environment";

export const calculateInvisibilityScore = ({
  isMale,
  superheroScore,
  age,
}: {
  isMale: boolean;
  superheroScore: number;
  age: number;
}) => {
  const genderWeighting = isMale
    ? parseInt(getEnvVariable("WEIGHTING_MALE"))
    : parseInt(getEnvVariable("WEIGHTING_FEMALE"));

  /* Prevent negative base scores */
  const baseScore = Math.max(genderWeighting * (superheroScore - age), 0);

  const maxScore = genderWeighting * 100;
  const normalizedScore = (baseScore / maxScore) * 100;

  return normalizedScore;
};

export const flattenUserData = (userData: UserDetails): BasicUserData => ({
  userId: userData.login.uuid,
  email: userData.email,
  name: `${userData.name.first} ${userData.name.last}`,
  gender: userData.gender,
  age: userData.dob.age,
  dob: userData.dob.date,
  phone: userData.phone,
  cell: userData.cell,
  image: userData.picture.large,
});
