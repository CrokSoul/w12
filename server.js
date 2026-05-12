const express = require('express')
const app = express()
const port = 3045

app.get('/', (req, res) => {
  res.send('Hello World 2.0 bNYX!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})