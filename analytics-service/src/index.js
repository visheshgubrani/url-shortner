import app from './app.js'
import connectDb from './db/connectDb.js'
import dotenvFlow from 'dotenv-flow'

dotenvFlow.config()

connectDb()
  .then(() => {
    const port = process.env.PORT || 3001
    app.listen(port, () => {
      console.log('The Server is running on http://locahost:', port)
    })
  })
  .catch((err) => {
    console.log(`Error connecting to the DB ${err}`)
  })
