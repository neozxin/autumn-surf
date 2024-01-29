// Redis steps:
// 1. server: Start REDIS server: $ docker run -d --name redis-xdev -p 6379:6379 -v ~/docker-xvol/data:/data redis:7 redis-server --save 60 1 --loglevel warning
// 2. client: xRedisUtil.connectServer('redis://localhost:6379');
// 3. client: xRedisUtil.writeData('set', 'test_key1', 'test_value_of_key1'); // write data by redis command
// 4. client: xRedisUtil.readData('get', 'test_key1'); // read data by redis command
// 5. client: xRedisUtil.disconnectServer();
export const xRedisUtil = (() => {
  /** @type {import('redis')} */
  const redis = globalThis.require?.("redis");
  return {
    xModules: {
      redis,
    },
    /** @type {import('redis').RedisClientType | null} */
    client: null,
    url: null,
    async connectServer(url = "redis://localhost:6379") {
      this.client = await redis
        .createClient({ url })
        .on("error", (err) => console.error("错误 Redis Client Error", err))
        .connect();
      this.url = url;
      console.log(`[REDIS client] 成功连接到 server ${url}`);
    },
    async writeData(command, key, value) {
      console.log(`[REDIS client] 命令 ${command} 写入 ${key}: ${value}`);
      const result = await this.client?.[command](key, value);
      console.log(`[REDIS client] 结果: ${result}`);
    },
    async readData(command, key) {
      console.log(`[REDIS client] 命令 ${command} 获取 ${key}`);
      const value = await this.client?.[command](key);
      console.log(`[REDIS client] 结果: ${value}`);
      return value;
    },
    async disconnectServer() {
      await this.client?.disconnect();
      console.log(`[REDIS client] 与 server ${this.url} 连接断开`);
      this.client = null;
      this.url = null;
    },
  };
})();
