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
        try {
          const latestStories = extractLatestStories(data);
          resolve(latestStories);
        } catch (error) {
          reject("Error extracting latest stories: " + error);
        }
      });
    });

    req.on("error", (error) => {
      reject("Request error: " + error);
    });

    req.end();
  });
};

const extractLatestStories = (html) => {
  const latestStories = [];

  const itemStart = '<li class="latest-stories__item">';
  const itemEnd = "</li>";
  let currentIndex = html.indexOf(itemStart);

  while (currentIndex !== -1) {
    const endIndex = html.indexOf(itemEnd, currentIndex);
    const item = html.slice(currentIndex, endIndex + itemEnd.length);

    const linkStart = 'href="';
    const linkEnd = '"';
    const linkIndex = item.indexOf(linkStart) + linkStart.length;
    const linkEndIndex = item.indexOf(linkEnd, linkIndex);
    const link = "https://time.com" + item.slice(linkIndex, linkEndIndex);

    const titleStart = '<h3 class="latest-stories__item-headline">';
    const titleEnd = "</h3>";
    const titleIndex = item.indexOf(titleStart) + titleStart.length;
    const titleEndIndex = item.indexOf(titleEnd, titleIndex);
    const title = item.slice(titleIndex, titleEndIndex).trim();

    latestStories.push({ title, link });

    currentIndex = html.indexOf(itemStart, endIndex);
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
