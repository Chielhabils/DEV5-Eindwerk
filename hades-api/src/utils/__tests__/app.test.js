const Helpers = require('../utils/helpers');
const app = require("../server");
const supertest = require("supertest");
const request = supertest(app);

test('Test if UUID is returned', () => {
    expect(Helpers.generateUUID).not.toBeUndefined();
  });


describe("Test if GET /storyblocks", () => {
  it("responds with all storyblocks", async (done) => {
    try {
      const response = await request.get("/storyblocks");
      expect(response.status).toBe(200);
      expect(typeof response.body).toBe("object", done());
    } catch (error) {}
  });
});


describe("Test if POST /poststoryblock works", () => {
  it("Return 400 when more than 100 characters", async (done) => {
    const response = await request
        .post("/poststoryblock")
        .send({ content: "12345678910111213141516171819202122232425262728293031323456789654567896547856765434567876543456754356789087654345678765434567876098765432" });
    expect(response.status).toBe(400, done());
  })
});


// Integratie // 

describe("Test if POST /poststoryblock and DELETE /deletestoryblock work", () => {
  let uuid;
  it("Return 200 when record added to database and return an UUID", async (done) => {
      const response = await request
        .post("/poststoryblock")
        .send({ content: "Carapils" });
      expect(response.status).toBe(200);
      uuid = response.body.uuid;
      done();
  });
  it("Look for latest record in database", async (done) => {
      const response = await request.get("/storyblock/" + uuid);
      expect(response.status).toBe(200);
      expect(typeof response.body).toBe("object");
      done();
  });
  it("Return 200 when storyblock is deleted", async (done) => {
      const response = await request.delete("/deletestoryblock").send({ uuid: uuid });
      expect(response.status).toBe(200);
      done();
  });
  it("Return 400 when no uuid is given when trying to delete a storyblock", async (done) => {
      const response = await request.delete("/deletestoryblock").send({});
      expect(response.status).toBe(400);
      done();
  });
  it("Return 400 when more properties are sent", async (done) => {
      const response = await request.delete("/deletestoryblock").send({ uuid: uuid, test: 'test' });
      expect(response.status).toBe(400);
      done();
  });
});
