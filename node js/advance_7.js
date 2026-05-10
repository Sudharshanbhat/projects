const http = require("http");

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });

  const data = {
    name: "Student",
    usn: "1RV21CS001"
  };

  res.end(JSON.stringify(data));
});

server.listen(3000);