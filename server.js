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
  const storyPattern =
    /<li class="latest-stories__item">.*?<a href="(.*?)">.*?<h3 class="latest-stories__item-headline">(.*?)<\/h3>.*?<time class="latest-stories__item-timestamp">(.*?)<\/time>/gs;

  let match;
  while ((match = storyPattern.exec(html)) !== null) {
    const link = "https://time.com" + match[1];
    const title = match[2];

    latestStories.push({ title, link });
  }

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
