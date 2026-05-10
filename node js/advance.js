//5. Simple HTTP Server
const http = require("http");

const server = http.createServer((req, res) => {
  res.write("Server is running");
  res.end();
});

server.listen(3000, () => {
  console.log("Server started at port 3000");
});

