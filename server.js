const http = require("http");
const https = require("https");
const PORT = 3000;

const fetchLatestStories = () => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "time.com",
      path: "/",
      method: "GET",
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const latestStories = extractLatestStories(data);

        if (latestStories) {
          resolve(latestStories);
        } else {
          reject("Unable to extract latest stories.");
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
};

const extractLatestStories = (html) => {
  const latestStories = [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const storyElements = doc.querySelectorAll(".latest-stories__item");

  storyElements.forEach((element) => {
    const link =
      "https://time.com" + element.querySelector("a").getAttribute("href");
    const title = element
      .querySelector(".latest-stories__item-headline")
      .textContent.trim();

    latestStories.push({ title, link });
  });

  return latestStories;
};

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/getTimeStories" && req.method === "GET") {
    try {
      const latestStories = await fetchLatestStories();
      const jsonData = JSON.stringify(latestStories, null, 2);
      res.statusCode = 200;
      res.end(jsonData);
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Not Found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
