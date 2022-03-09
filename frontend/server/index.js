const path = require('path');
const morgan = require('morgan');
const express = require('express');
const httpProxy = require('http-proxy');
const apiProxy = httpProxy.createProxyServer();
const backend = process.env.BACKEND || 'http://localhost:8999'
const PORT = process.env.PORT || 3001
const app = express();

console.log(`configured backend ${backend}`)
app.use(morgan('combined'))
app.use(express.static(path.resolve(__dirname, '.')));
app.get("/tickets", (req, res) => {
  console.log('redirecting to backend');
  apiProxy.web(req, res, {target: backend});
});
app.post("/tickets", (req, res) => {
  console.log('redirecting to Server1');
  apiProxy.web(req, res, {target: backend});
});
app.get('*', (_, res) => {
  res.sendFile(path.resolve(__dirname, '.', 'index.html'));
});
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
