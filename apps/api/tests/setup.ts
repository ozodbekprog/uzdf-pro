process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres@127.0.0.1:55432/uzdfpro_test?schema=public";
process.env.JWT_SECRET = "test-secret-123456789";
