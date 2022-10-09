const express = require('express');
const app = express();

const GUN = require('gun')

const port = 6100 || process.env.PORT;

app.use(GUN.serve);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const relayServer = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

GUN({web: relayServer});