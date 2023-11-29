import dgram from "dgram";
import net from "net";

export const xNetworkUtil = {
  // UDP steps:
  // 1. both server & client: xNetworkUtil.UDP.createUDPSocket(); // or e.g. $ nc -u remotehost 8888
  // 2. both server & client: share currentUDPAddress with the other side
  // 3. client: xNetworkUtil.UDP.sendUDPMessage(currentUDPAddress_server, 'my message 1');
  // 4. server: xNetworkUtil.UDP.sendUDPMessage(currentUDPAddress_client, 'my message 2');
  UDP: {
    /** @type {import('dgram').Socket | null} */
    socketUDP: null,
    get currentUDPAddress() {
      return this.socketUDP?.address();
    },
    createUDPSocket(localBind = "", socketUDP = dgram.createSocket("udp4")) {
      this.socketUDP = socketUDP;
      socketUDP.bind(...localBind.split(":").reverse().filter(Boolean));
      socketUDP.on("listening", () => {
        console.log(
          `[UDP] 开始监听 ${this.currentUDPAddress.address}:${this.currentUDPAddress.port}`,
        );
      });
      socketUDP.on("message", (msg, info) => {
        console.log(
          `[UDP] 收到来自 ${info.address}:${info.port} 的 datagram 信息: ${msg}`,
        );
      });
      return socketUDP;
    },
    sendUDPMessage(remoteBind, message) {
      return this.socketUDP?.send(
        Buffer.from(message),
        ...remoteBind.split(":").reverse(),
      );
    },
  },
  // TCP steps:
  // 1. server: xNetworkUtil.TCP.createTCPServer();
  // 2. server: share serverAddress with clients
  // 3. clients: xNetworkUtil.TCP.createTCPClient(serverAddress); // or e.g. $ nc remotehost 8888
  // 4. clients: xNetworkUtil.TCP.sendTCPMessage(xNetworkUtil.TCP.clientTCP, 'my message 1');
  // 5. server: xNetworkUtil.TCP.sendTCPMessage(xNetworkUtil.TCP.serverTCPClients[x], 'my message 2');
  TCP: {
    /** @type {import('net').Server | null} */
    serverTCP: null,
    /** @type {import('net').Socket[]} */
    serverTCPClients: [],
    /** @type {import('net').Socket | null} */
    clientTCP: null,
    get currentTCPServerAddress() {
      return this.serverTCP?.address();
    },
    get currentTCPClientAddress() {
      return this.clientTCP?.address();
    },
    createTCPServer(localBind = "") {
      const serverTCP = net.createServer((socketTCP) => {
        this.serverTCPClients.push(socketTCP);
        const clientLabel = `(${socketTCP.remoteAddress}:${socketTCP.remotePort})`;
        console.log(`[TCP server] 与 client ${clientLabel} 成功 handshake`);
        socketTCP.on("data", (data) => {
          console.log(
            `[TCP server] 收到 client ${clientLabel} 信息: ${data.toString()}`,
          );
        });
        socketTCP.on("end", () => {
          console.log(`[TCP server] 与 client ${clientLabel} 连接断开`);
        });
      });
      serverTCP.listen(
        ...localBind.split(":").reverse().filter(Boolean),
        () => {
          console.log(
            `[TCP server] 开始监听 ${this.currentTCPServerAddress.address}:${this.currentTCPServerAddress.port}`,
          );
        },
      );
      this.serverTCP = serverTCP;
      return serverTCP;
    },
    createTCPClient(remoteBind) {
      const serverLabel = () =>
        `(${this.clientTCP.remoteAddress}:${this.clientTCP.remotePort})`;
      const clientTCP = net.createConnection(
        ...remoteBind.split(":").reverse(),
        () => {
          console.log(`[TCP client] 成功连接到 server ${serverLabel()}`);
        },
      );
      clientTCP.on("data", (data) => {
        console.log(
          `[TCP client] 收到 server ${serverLabel()} 信息: ${data.toString()}`,
        );
      });
      clientTCP.on("end", () => {
        console.log(`[TCP client] 与 server ${serverLabel()} 连接断开`);
      });
      this.clientTCP = clientTCP;
      return clientTCP;
    },
    sendTCPMessage(socketTCP, message) {
      socketTCP.write(message);
    },
  },
};
