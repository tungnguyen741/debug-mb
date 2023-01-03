const Koa = require('koa');
const serve = require('koa-static')
const https = require('https');
const path = require('path');

const router = require('./middle/router');
const compress = require('./middle/compress');
const util = require('./lib/util');
const fs = require('licia/fs');
const endWith = require('licia/endWith');
const WebSocketServer = require('./lib/WebSocketServer');

async function start({
  port = process.env.PORT || 8080,
  host,
  domain = process.env.DOMAIN || 'localhost',
  server,
  cdn,
  https: useHttps,
  sslCert,
  sslKey,
  basePath = '/',
} = {}) {
  const domainLogging = domain + `:${port}`;
  if (!endWith(basePath, '/')) {
    basePath += '/';
  }

  const app = new Koa();
  const wss = new WebSocketServer();

  app.use(compress()).use(router(wss.channelManager, process.env.NODE_ENV === 'production' ? domain : domainLogging, cdn, basePath));
  app.use(serve(path.join(__dirname, '../../public/front_end')))
  app.use(serve(path.join(__dirname, '/public')))
  app.use(serve(path.join(__dirname, '../public')))
  app.use(serve(path.join(__dirname, '../../public')))

  if (server) {
    server.on('request', app.callback());
    wss.start(server);
  } else {
    util.log(`starting server at ${domainLogging}${basePath}`);
    if (useHttps) {
      const cert = await fs.readFile(sslCert, 'utf8');
      const key = await fs.readFile(sslKey, 'utf8');
      const server = https
        .createServer(
          {
            key,
            cert,
          },
          app.callback()
        )
        .listen(port, host);
      wss.start(server);
    } else {
      const server = app.listen(port, host);
      wss.start(server);
    }
  }
}
start();
module.exports = {
  start,
};
