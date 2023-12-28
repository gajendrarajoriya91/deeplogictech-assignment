const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/getTimeStories" && req.method === "GET") {
    fs.readFile("data.json", "utf8", (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "Internal Server Error" }));
        return;
      }

      const jsonData = JSON.parse(data);
      res.statusCode = 200;
      res.end(JSON.stringify(jsonData));
    });
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
