const request = require("supertest");

const raw = require("../models/index");
const apps = require("../apps");
const { json } = require("sequelize");

let servers, agents;

describe("Todo appslication", function () {
  beforeAll(async () => {
    await raw.sequelize.sync({ force: true });
    servers = apps.listen(3000, () => {});
    agents = request.agents(servers);
  });

  afterAll(async () => {
    try {
      await raw.sequelize.close();
      await servers.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Creates a todo and responds with json at /todos POST endpoint", async () => {
    const response = await agents.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    expect(response.statusCode).toBe(200);
    expect(response.header["content-type"]).toBe(
      "appslication/json; charset=utf-8"
    );
    const parsedResponse = JSON.parse(response.text);
    expect(parsedResponse.id).toBeDefined();
  });

  test("Marks a todo with the given ID as complete", async () => {
    const response = await agents.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;

    expect(parsedResponse.completed).toBe(false);

    const markCompleteResponse = await agents
      .put(`/todos/${todoID}/markASCompleted`)
      .send();
    const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  test("Fetches all todos in the database using /todos endpoint", async () => {
    await agents.post("/todos").send({
      title: "Buy xbox",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    await agents.post("/todos").send({
      title: "Buy ps3",
      dueDate: new Date().toISOString(),
      completed: false,
    });
    const response = await agents.get("/todos");
    const parsedResponse = JSON.parse(response.text);

    expect(parsedResponse.length).toBe(4);
    expect(parsedResponse[3]["title"]).toBe("Buy ps3");
  });

  test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
    // FILL IN YOUR CODE HERE
    const response = await agents.post("/todos").send({
      title: "Buy a milk powder",
      dueDate: new Date().toISOString(),
      completed: false,
    });

    const parsedResponse = JSON.parse(response.text);
    const todoID = parsedResponse.id;

    const deleteExistingRecordResponse = await agents
      .delete(`/todos/${todoID}`)
      .send();
    const parsedDeleteExistingRecordResponse = JSON.parse(
      deleteExistingRecordResponse.text
    );

    expect(parsedDeleteExistingRecordResponse).toBe(true);

    const deleteNonExistingRecord = await agents.delete(`/todos/1321`).send();
    const parseddeleteNonExistingRecord = JSON.parse(
      deleteNonExistingRecord.text
    );
    expect(parseddeleteNonExistingRecord).toBe(false);
  });
});
