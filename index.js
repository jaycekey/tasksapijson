const http = require("http");
const path = require("path");
const fs = require("fs/promises");
const { parse } = require("path");

const PORT = 8000;

const app = http.createServer(async (request, response) => {
  const method = request.method;
  const url = request.url;

  const getLastId = (dataArray) => {
    const lastElementIndex = dataArray.length - 1;
    return dataArray[lastElementIndex].id + 1;
  };

  if (url === "/tasks") {
    const jsonPath = path.resolve("./data.json");
    const jsonFile = await fs.readFile(jsonPath, "utf8");
    if (method === "GET") {
      response.setHeader("Content-Type", "application/json");
      response.write(jsonFile);
    } else if (method == "POST") {
      request.on("data", async (data) => {
        const newTask = JSON.parse(data);
        const tasksArray = JSON.parse(await fs.readFile(jsonPath, "utf8"));
        tasksArray.push({ id: getLastId(tasksArray), ...newTask });
        await fs.writeFile(jsonPath, JSON.stringify(tasksArray));
      });
    } else if (method == "PUT") {
      request.on("data", async (data) => {
        const { status } = data;
        const { id } = request.params;
        const tasksArray = JSON.parse(await fs.readFile(jsonPath, "utf8"));
        const taskIndex  = tasksArray.find((task) => task.id === id);
        tasksArray[taskIndex].status = status;
        await fs.writeFile(jsonPath, JSON.stringify(tasksArray));
      });
    } else if (method == "DELETE") {
      const { id } = request.params;
      const tasksArray = JSON.parse(await fs.readFile(jsonPath, "utf8"));
      const taskIndex = tasksArray.findIndex((task) => task.id === id);
      tasksArray.splice(taskIndex, 1);
      await fs.writeFile(jsonPath, JSON.stringify(tasksArray));
    }
  }
  response.end();
});

app.listen(PORT);

console.log("sevidor corriendo");
