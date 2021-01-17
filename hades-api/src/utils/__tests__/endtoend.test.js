const Helpers = require('../helpers');
const app = require("../../server");
const supertest = require("supertest");
const request = supertest(app);

test('Test if UUID is returned', () => {
    expect(Helpers.generateUUID).not.toBeUndefined();
  });

describe("The end-to-end test", () => {
    let boonID;
    let godID;
    it("creates a god", async (done) => {
            const response = await request
                .post("/god")
                .send({
                    name: "Hades",
                    description: "God of the underworld"
                });
            expect(response.status).toBe(200);
            godID = response.body.res[0].uuid;
            done();
    });
    it("gets the newly added god", async(done) => {
            const response = await request
                .get("/god/" + godID)   
            expect(response.status).toBe(200);
            expect(response.body.name).toBe("Hades");
            done();
    })
    it("creates a boon", async (done) => {
            const response = await request
                .post("/boon")
                .send({ 
                    godname : "Hades",
                    content : "Adds 50% attack speed"
            });
            expect(response.status).toBe(200);
            boonID = response.body.uuid;
            done();
    })
    it("gets the newly added boon", async(done) => {
            const response = await request
                .get("/boon/" + boonID)
            expect(response.status).toBe(200);
            expect(response.body.content).toBe("Adds 50% attack speed");
            done();
    })
    it("changes the benefit of the boon", async (done) => {
            const response = await request
                .patch("/boon/" + boonID)
                .send({content: "Resurrects fallen enemies"});
            expect(response.status).toBe(200);
            done();
    })
    it("gets the updated boon with the updated benefit", async(done) => {
            const response = await request
                .get("/boon/" + boonID)
            expect(response.status).toBe(200);
            expect(response.body.content).toBe("Resurrects fallen enemies");
            done();
    })
    it("deletes the ticket", async (done) => {
            const response = await request
                .delete("/boon")
                .send({uuid: boonID});
            expect(response.status).toBe(200);
            done();
    })
    it("will not find boon, since its deleted", async(done) => {
            const response = await request
                .get("/boon/" + boonID)
            expect(response.status).toBe(404);
            done();
    })
    it("deletes the god", async (done) => {
            const response = await request
                .delete("/god")
                .send({uuid: godID});
            expect(response.status).toBe(200);
            done();
    })
    it("will not find god, since its deleted", async(done) => {
            const response = await request
                .get("/god/" + godID)
            expect(response.status).toBe(404);
            done();
    })
});

