const xSSEUtil = {
  Server: {
    express: require("express"),
    /** @type {import('express').Express | null} */
    app: null,
    createServer(localBind) {
      const app = this.express();
      this.app = app;
      app.get("/", (req, res) => res.send(`hello! ${new Date()}`));
      app.get("/stream", (req, res) => {
        console.log(`[server] 收到 client ${req.ip} 请求 ${req.url}`);
        res.setHeader("Content-Type", "text/event-stream");
        send(res);
      });
      const [localAddress, localPort] = localBind.split(":");
      app.listen(localPort, localAddress, () => {
        console.log(`[server] 开始监听 ${localAddress}:${localPort}`);
      });
      function send(res, i = 0) {
        res.write(`data: hello 来自 server ---- [${i}]\n\n`);
        setTimeout(() => send(res, i + 1), 1000);
      }
    },
  },
  Client: {
    createRequest(remoteUrl) {
      const sse = new EventSource(remoteUrl);
      sse.onmessage = console.log;
      return sse;
    },
  },
};
