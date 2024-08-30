import { calculateInvisibilityScore, flattenUserData } from "./utils";
import { getEnvVariable } from "./environment";
import { UserDetails } from "@type/user";

jest.mock("./environment");

const mockGetEnvVariable = getEnvVariable as jest.Mock;

describe("utility functions", () => {
  describe("calculateInvisibilityScore", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("should calculate invisibility score for male", () => {
      mockGetEnvVariable.mockImplementation((key: string) => {
        if (key === "WEIGHTING_MALE") return "5";
        if (key === "WEIGHTING_FEMALE") return "0";
      });

      const score = calculateInvisibilityScore({
        isMale: true,
        superheroScore: 50,
        age: 30,
      });

      expect(score).toBe(20);
    });

    it("should calculate invisibility score for female", () => {
      mockGetEnvVariable.mockImplementation((key: string) => {
        if (key === "WEIGHTING_MALE") return "0";
        if (key === "WEIGHTING_FEMALE") return "5";
      });

      const score = calculateInvisibilityScore({
        isMale: false,
        superheroScore: 40,
        age: 30,
      });

      expect(score).toBe(10);
    });
  });

  describe("flattenUserData", () => {
    it("should result in data without any nesting", () => {
      /* No need to define whole object so cheating a little with type */
      const userData: UserDetails = {
        login: { uuid: "user-id-123", username: "test-user" },
        email: "test@example.com",
        name: { first: "John", last: "Doe" },
        gender: "male",
        dob: { age: 30, date: "1991-01-01" },
        phone: "123-456-7890",
        cell: "098-765-4321",
        picture: { large: "http://example.com/image.jpg" },
      } as unknown as UserDetails;

      const flattenedData = flattenUserData(userData);

      const isFlat = Object.values(flattenedData).every(
        (value) => typeof value !== "object" || value === null
      );

      expect(isFlat).toBe(true);
    });
  });
});
