// SSE(Server Sent Event) steps:
// 1. server side: Start REDIS server: $ docker run -d --name redis-xdev --net=host -v ~/docker-xvol/data:/data redis:7 redis-server --save 60 1 --loglevel warning
// 2. server side: xSSEUtil.Server.createServer(localBind);
// 3. client side: open webpage http(s)://[remoteDomain]/
// 4. client side: xSSEUtil.Client.createRequest(remoteUrl);
// 5. server side: xSSEUtil.Server.sendMessage(xSSEUtil.Server.currentResponses.slice(-1)[0], 'test stream message 1');
// 6. server side: xSSEUtil.Server.sendMessage(xSSEUtil.Server.currentResponses.slice(-1)[0], 'test stream message 2');
export const xSSEUtil = {
  Server: {
    /** @type {import('express')} */
    express: globalThis.require?.("express"),
    /** @type {import('express').Express | null} */
    app: null,
    /** @type {import('express').Response[]} */
    currentResponses: [],
    createServer(localBind) {
      const app = this.express();
      this.app = app;
      app.get("/", (req, res) => res.send(`hello! ${new Date()}`));
      app.get("/stream", (req, res) => {
        console.log(`[server] 收到 client ${req.ip} 请求 ${req.url}`);
        res.setHeader("Content-Type", "text/event-stream");
        this.currentResponses.push(res);
        this.sendMessage(res, "来自 server 的消息: stream welcome!");
      });
      const [localAddress, localPort] = localBind.split(":");
      app.listen(localPort, localAddress, () => {
        console.log(`[server] 开始监听 ${localAddress}:${localPort}`);
      });
    },
    sendMessage(response, message) {
      const sseMessageField = (content) => `data: ${content}\n\n`;
      response.write(sseMessageField(message));
    },
  },
  Client: {
    sse: null,
    createRequest(remoteUrl) {
      const sse = new EventSource(remoteUrl);
      this.sse = sse;
      sse.onmessage = console.log;
      return sse;
    },
  },
};
