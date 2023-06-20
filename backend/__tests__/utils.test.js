const jwt = require("jsonwebtoken");
const sinon = require("sinon");
import generateToken from "../utils/generateToken";

describe("generateToken()", () => {
  let res;
  let userId;

  beforeEach(() => {
    res = {
      cookie: sinon.fake(),
    };

    userId = "test_user_id";
    process.env.JWT_SECRET = "test_jwt_secret";
    process.env.NODE_ENV = "test";
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should generate a valid JWT token and set it as a cookie in the response", () => {
    generateToken(res, userId);

    expect(res.cookie.calledOnce).toBe.true;

    const [cookieName, cookieValue, cookieOptions] = res.cookie.getCall(0).args;
    expect(cookieName).toEqual("jwt");
    expect(typeof cookieValue).toEqual("string");

    const decodedToken = jwt.verify(cookieValue, process.env.JWT_SECRET);
    expect(decodedToken.userId).toEqual(userId);

    expect(cookieOptions.httpOnly).toBeTruthy;
    expect(cookieOptions.secure).toBeTruthy;
    expect(cookieOptions.sameSite).toEqual("strict");
    expect(cookieOptions.maxAge).toEqual(10 * 24 * 60 * 60 * 1000);
  });
});
