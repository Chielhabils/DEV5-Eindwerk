const Helpers = require('../helpers');
const app = require("../../server");
const supertest = require("supertest");
const request = supertest(app);

test('Test if UUID is returned', () => {
    expect(Helpers.generateUUID).not.toBeUndefined();
  });


describe("Test if GET /boons", () => {
  it("responds with all boons", async (done) => {
    try {
      const response = await request.get("/boons");
      expect(response.status).toBe(200);
      expect(typeof response.body).toBe("object", done());
    } catch (error) {}
  });
});

describe('Test if POST /boon', () => {
  it('POST /boon', async (done) => {
      const response = await request
          .post('/boon')
          .send({
              "godname" : "god number 1",
              "content" : "Adds 50% attack speed"
          });
          expect(response.status).toBe(200, done());
      })           
  });

/*******************************/
/*      Integration test       */
/*******************************/

describe("Test if boon is created and deleted", () => {
  let uuid;
  it("Return 200 when record added to database and return an UUID", async (done) => {
    const response = await request
        .post('/boon')
        .send({
            "godname" : "god number 1",
            "content" : "Adds 50% attack speed"
        });
        expect(response.status).toBe(200);
        uuid = response.body.res[0].uuid;
        done();
    }) ;
  it("Look for latest record in database", async (done) => {
      const response = await request.get("/boon/" + uuid);
      expect(response.status).toBe(200);
      expect(typeof response.body).toBe("object");
      done();
  });
  it("Return 200 when boon is deleted", async (done) => {
      const response = await request.delete("/boon").send({ uuid: uuid });
      expect(response.status).toBe(200);
      done();
  });
  it("Return 400 when no uuid is given when trying to delete a boon", async (done) => {
      const response = await request.delete("/boon").send({});
      expect(response.status).toBe(400);
      done();
  });
});

