import app from "./app"
import connectDb from "./db/connectDb"

connectDb().then(() => {
  const port = process.env.PORT || 3001
  app.listen(port, () => {
    console.log("The Server is running on http://locahost:", port)
  })
})
