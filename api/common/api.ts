import axios from "axios";

import { UserDetails } from "@type/user";
export const retrieveUserDetails = async (userId: string) => {
  const url = process.env.USER_DETAILS_URL as string;

  try {
    const userDetails = await axios.get(url, {
      params: { seed: userId },
    });

    return userDetails.data.results[0] as UserDetails;
  } catch {
    return null;
  }
};
