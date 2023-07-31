import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { protect } from "../middleware/authMIddleware.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

import dotenv from "dotenv";
dotenv.config();

describe("protect middleware", () => {
  it("should be defined", () => {
    expect(protect).toBeDefined();
  });

  it("should set req.body.user with valid token and call next", async () => {
    const user = {
      _id: "user1",
      name: "John Doe",
      email: "john@example.com",
      password: "123",
    };

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    const req = {
      cookies: {
        jwt: token,
      },
      body: {},
    };
    const res = {};

    const next = jest.fn();
    jest.spyOn(jwt, "verify").mockReturnValue({ userId: user._id });

    // jest.spyOn(User, "findById").mockResolvedValue({
    //   _id: user._id,
    //   name: user.name,
    //   email: user.email,
    // });

    jest.spyOn(User, "findById").mockImplementation(() => {
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        select: jest.fn().mockImplementation((fields) => {
          // Remove the "password" field here
          return {
            _id: user._id,
            name: user.name,
            email: user.email,
          };
        }),
      };
    });

    let x = await protect(req, res, next);

    expect(req.body.user).toEqual({
      _id: "user1",
      name: "John Doe",
      email: "john@example.com",
    });

    expect(jwt.verify).toHaveBeenCalled();
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET);
    expect(User.findById).toHaveBeenCalledWith(user._id);
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 and throw an error for invalid token", async () => {
    const req = {
      cookies: {
        jwt: "invalid-token",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("Invalid token");
    });

    try {
      await protect(req, res, next);
    } catch (error) {
      expect(error.message).toBe("Not authorized, invalid token");
    }

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      error: "Not authorized, invalid token",
    });
  });

  it("should return 401 and error if token is not provided", async () => {
    const req = {
      cookies: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    try {
      await protect(req, res, next);
    } catch (error) {
      expect(error.message).toBe("Not authorized, no token");
    }

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Not authorized, no token",
    });
  });
});

// first understand what this middleware does
describe.skip("errorMiddleware", () => {
  test.skip("Returns 500 status code and error message if res status code is 200", () => {
    const err = new Error("Test error");
    const req = {};
    const res = { status: jest.fn(), statusCode: 200, json: jest.fn() };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Test error",
      stack: expect.any(String),
    });
  });

  test.skip("Returns 404 status code and 'Resource not found' message for CastError with ObjectId kind", () => {
    const err = { name: "CastError", kind: "ObjectId", message: "Test error" };
    const req = {};
    const res = { statusCode: 200, json: jest.fn() };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Resource not found",
      stack: expect.any(String),
    });
  });

  test("Returns error stack only in development environment", () => {
    const err = new Error("Test error");
    const req = {};
    const res = { status: jest.fn(), statusCode: 500, json: jest.fn() };
    const next = jest.fn();

    const prevNodeEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = "development";
    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      message: "Test error",
      stack: expect.any(String),
    });

    process.env.NODE_ENV = "production";
    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      message: "Test error",
      stack: null,
    });

    process.env.NODE_ENV = prevNodeEnv;
  });
});
