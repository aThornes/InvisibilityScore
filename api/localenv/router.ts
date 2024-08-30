// import { handler as getInvisibilityScore } from "../lambdas/getInvisibilityScore/handler";
import { applyMock } from "./mock/applymock";
import { runLambda } from "./mock/lambda";

const getInvisibilityScore = applyMock("lambdas/getInvisibilityScore/handler");

const defineRoutes = (app: import("express").Application) => {
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  app.get("/invisibility-score", (req, res) => {
    runLambda({
      lambdaFn: getInvisibilityScore,
      res,
      req,
    });
  });
};

export default defineRoutes;
