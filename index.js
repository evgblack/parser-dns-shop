var parser = require('./parser')
const express = require('express')
const app = express()
const port = 3000

app.get('/parse', async (req, res) => {
  const result = await parser.start();
  console.log(result);
  res.send(result);
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

/*
async function start(){
  const result = await parser.start();
  console.log(result);
}

start();
*/