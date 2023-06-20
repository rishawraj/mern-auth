import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("User Schema", () => {
  beforeEach(async () => {
    await User.deleteMany();
  });

  it("should save a user with encrypted password", async () => {
    const user = new User({
      name: "John Doe",
      email: "john@gmal.com",
      password: "123",
    });

    await user.save();

    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("john@gmal.com");
    expect(await bcrypt.compare("123", user.password)).toBe(true);
  });

  it("should not modify the password if it's not changed", async () => {
    const user = new User({
      name: "John Doe",
      email: "john@gmal.com",
      password: "123",
    });

    await user.save();

    user.name = "Updated Name";

    await user.save();

    expect(user.name).toBe("Updated Name");
    expect(await bcrypt.compare("123", user.password)).toBe(true);
  });
});
