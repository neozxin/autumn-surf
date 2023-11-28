const xWebsocketUtil = {
  Server: {
    http: require("http"),
    websocket: require("websocket"),
    /** @type {import('http').Server | null} */
    httpServer: null,
    /** @type {import('websocket').server | null} */
    websocketServer: null,
    /** @type {import('websocket').connection[]} */
    serverConnectionClients: [],
    get currentHttpServerAddress() {
      return this.httpServer?.address();
    },
    serverCreateWebsocket(localBind = "") {
      const httpServer = this.http.createServer((req, res) => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(`Hello! ${req.url}`);
      });
      httpServer.listen(
        ...localBind.split(":").reverse().filter(Boolean),
        () => {
          console.log(
            `[HTTP server] 开始监听 ${this.currentHttpServerAddress.address}:${this.currentHttpServerAddress.port}`,
          );
        },
      );
      const websocketServer = new this.websocket.server({ httpServer });
      websocketServer.on("request", (request) => {
        const connection = request.accept(null, request.origin);
        const clientLabel = `(${connection.socket.remoteAddress}:${connection.socket.remotePort})`;
        console.log(`[WS Server] 与 client ${clientLabel} 成功建立连接`);
        connection.on("message", (message) => {
          this.serverConnectionClients.forEach((c) =>
            c.send(`来自 client ${clientLabel} 的消息: ${message.utf8Data}`),
          );
        });
        connection.on("close", () => {
          console.log(`[WS Server] 与 client ${clientLabel} 连接断开`);
          this.serverConnectionClients = this.serverConnectionClients.filter(
            (c) => c !== connection,
          );
          this.serverConnectionClients.forEach((c) =>
            c.send(`来自 server 的消息: client ${clientLabel} 刚刚离开连接`),
          );
        });
        this.serverConnectionClients.push(connection);
        this.serverConnectionClients.forEach((c) =>
          c.send(`来自 server 的消息: client ${clientLabel} 刚刚加入连接`),
        );
      });
      this.httpServer = httpServer;
      this.websocketServer = websocketServer;
      return {
        httpServer,
        websocketServer,
      };
    },
  },
  Client: {
    clientCreateWebsocket(remoteBind) {
      const ws = new WebSocket(`ws://${remoteBind}`);
      ws.onmessage = (message) => console.log(`Received: ${message.data}`);
      setTimeout(() => ws.send("Hello everyone! I'm new client."), 1000);
      return ws;
    },
  },
};
