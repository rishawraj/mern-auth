import request from "supertest";
import express, { response } from "express";
import bodyParser from "body-parser";
import userRoutes from "../routes/userRoutes";
import User from "../models/userModel";
import generateToken from "../utils/generateToken";
// import protect from "../middleware/authMIddleware";
import jwt from "jsonwebtoken";

// mocks
jest.mock("../models/userModel", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));
jest.mock("../utils/generateToken");

// jest.mock("../middleware/authMIddleware");

// Mock the protect middleware
const protect = jest.fn(async (req, res, next) => {
  // Bypass the middleware logic and call next directly
  next();
});

//init app
const app = express();

// app config
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api/users", userRoutes);

// tests
describe("POST /api/users", () => {
  describe("registerUser api", () => {
    test("User registration with valid data", async () => {
      const userData = {
        name: "raj",
        email: "raj@123.com",
        password: "123",
      };

      // mock functions
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: "mockedUserId",
        name: userData.name,
        email: userData.email,
      });

      const response = await request(app).post("/api/users/").send(userData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({
        _id: "mockedUserId",
        name: userData.name,
        email: userData.email,
      });

      expect(User.create).toBeCalledTimes(1);
      expect(User.findOne).toBeCalledTimes(1);
      expect(generateToken).toBeCalledTimes(1);
    });

    test("User Registration with existing email", async () => {
      User.findOne.mockResolvedValue(true);

      const response = await request(app).post("/api/users/").send({
        name: "john",
        email: "john@123.com",
        password: "123",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe("User already exists");
    });

    test("User registratoin with invalid data", async () => {
      User.findOne.mockResolvedValue(false);
      User.create.mockResolvedValue(false);

      const response = await request(app).post("/api/users/").send({
        name: "john",
        email: "john@123.com",
        password: "123",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toBe("Invalid User Data");
    });
  });

  describe("POST /auth api", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should authenticate a user with valid credentials", async () => {
      const mockUser = {
        _id: "user-id",
        name: "john doe",
        email: "john@gmail.com",
        password: "123",
        matchPassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app).post("/api/users/auth").send({
        email: "john@gmail.com",
        password: "123",
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        _id: "user-id",
        name: "john doe",
        email: "john@gmail.com",
      });
      expect(mockUser.matchPassword).toHaveBeenCalledWith("123");
    });

    test("should return an error for invalid email", async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/users/auth")
        .send({ email: "raj@gmail.com", password: "123" });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({ error: "Invalid email or password" });
    });

    test("should reuttnr an error for invalid password", async () => {
      const mockUser = {
        _id: "user-id",
        name: "john doe",
        email: "john@gmail.com",
        password: "123",
        matchPassword: jest.fn().mockResolvedValue(false),
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app).post("/api/users/auth").send({
        email: "john@gmail.com",
        password: "123",
      });

      expect(response.statusCode).toBe(401);
      expect(response.body).toEqual({ error: "Invalid email or password" });
    });
  });

  describe("POST /logout api", () => {
    test("should clear the jwt cookie and return a success message", async () => {
      const response = await request(app).post("/api/users/logout");

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ message: "User Logged Out" });
      // !
      expect(response.headers["set-cookie"][0]).toMatch(/jwt=;.*HttpOnly/);
      expect(response.headers["set-cookie"][0]).toContain(
        "Expires=Thu, 01 Jan 1970 00:00:00 GMT"
      );
    });
  });

  describe("GET /profile api", () => {
    test("should respond", async () => {
      const mockUser = {
        name: "raj",
        email: "raj@gmail.com",
      };

      const response = await request(app)
        .get("/api/users/profile")
        // .set("Authorization", "token")
        .send({ user: mockUser });

      console.log(response.statusCode);
      console.log(response.body);
    });
  });

  describe("PUT /profile api", () => {});
});
