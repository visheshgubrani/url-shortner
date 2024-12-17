import app from './app.js'
import connectDb from './db/connectDb.js'
import dotenvFlow from 'dotenv-flow'

dotenvFlow.config()

connectDb()
  .then(() => {
    const port = process.env.PORT || 3002
    app.listen(port, () => {
      console.log(`The server is running on http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.log(`Error connecting to the server ${err}`)
  })
