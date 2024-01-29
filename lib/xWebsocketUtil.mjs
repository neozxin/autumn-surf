// Websocket steps:
// 1. server side: xWebsocketUtil.Server.createWebsocketServer(localBind);
// 2. client side: open webpage http(s)://[remoteDomain]/
// 3. client side: xWebsocketUtil.Client.connectWebsocketServer(remoteBind);
// 4. server side: xWebsocketUtil.Server.websocketConnections.slice(-1)[0].send('test message 1 from server');
// 5. client side: xWebsocketUtil.Client.websocketConnection.send('test message 1 from client');
export const xWebsocketUtil = (() => {
  /** @type {import('http')} */
  const http = globalThis.require?.("http");
  /** @type {import('websocket')} */
  const websocket = globalThis.require?.("websocket");
  return {
    Server: {
      xModules: {
        http,
        websocket,
      },
      /** @type {import('http').Server | null} */
      httpServer: null,
      /** @type {import('websocket').server | null} */
      websocketServer: null,
      /** @type {import('websocket').connection[]} */
      websocketConnections: [],
      get currentHttpServerAddress() {
        return this.httpServer?.address();
      },
      createWebsocketServer(localBind = "") {
        const httpServer = http.createServer((req, res) => {
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
        const websocketServer = new websocket.server({ httpServer });
        websocketServer.on("request", (request) => {
          const connection = request.accept(null, request.origin);
          const clientLabel = `(${connection.socket.remoteAddress}:${connection.socket.remotePort})`;
          console.log(`[WS Server] 与 client ${clientLabel} 成功建立连接`);
          connection.on("message", (message) => {
            this.websocketConnections.forEach((c) =>
              c.send(`来自 client ${clientLabel} 的消息: ${message.utf8Data}`),
            );
          });
          connection.on("close", () => {
            console.log(`[WS Server] 与 client ${clientLabel} 连接断开`);
            this.websocketConnections = this.websocketConnections.filter(
              (c) => c !== connection,
            );
            this.websocketConnections.forEach((c) =>
              c.send(`来自 server 的消息: client ${clientLabel} 刚刚离开连接`),
            );
          });
          this.websocketConnections.push(connection);
          this.websocketConnections.forEach((c) =>
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
      sendMessage(message, filter = () => true) {
        return this.websocketConnections
          .filter(filter)
          .forEach((c) => c.send(message));
      },
    },
    Client: {
      /** @type {WebSocket} */
      websocketConnection: null,
      connectWebsocketServer(remoteBind = location.host) {
        this.websocketConnection = new WebSocket(`ws://${remoteBind}`);
        this.websocketConnection.onmessage = (message) =>
          console.log(`Received: ${message.data}`);
        setTimeout(
          () =>
            this.websocketConnection.send("Hello everyone! I'm new client."),
          1000,
        );
        return this.websocketConnection;
      },
      sendMessage(message) {
        return this.websocketConnection?.send(message);
      },
    },
  };
})();
