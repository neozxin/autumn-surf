// SSE(Server Sent Event) steps:
// 1. server side: xSSEUtil.Server.createServer(localBind);
// 2. client side: open webpage http(s)://[remoteDomain]/
// 3. client side: xSSEUtil.Client.createRequest(remoteUrl);
// 4. server side: xSSEUtil.Server.sendMessage(xSSEUtil.Server.currentResponses.slice(-1)[0], 'test stream message 1');
// 5. server side: xSSEUtil.Server.sendMessage(xSSEUtil.Server.currentResponses.slice(-1)[0], 'test stream message 2');
export const xSSEUtil = (() => {
  /** @type {import('express')} */
  const express = globalThis.require?.("express");
  return {
    Server: {
      xModules: {
        express,
      },
      /** @type {import('express').Express | null} */
      app: null,
      /** @type {import('express').Response[]} */
      currentResponses: [],
      createServer(localBind) {
        const app = express();
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
})();
