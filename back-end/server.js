const express = require('express');
const mongoose = require('mongoose');
const app = express()


app.use(express.json())
require('dotenv').config()

const port = process.env.PORT
console.log(port)

main()
.then(()=>console.log("Db Connected"))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URL)

}

//app.use('/product',productRouter)
//app.use('/categories',categoryRouter)


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})