import { URL } from "url"

const urlValidator = (req, res, next) => {
  try {
    const { url } = req.body
    new URL(url)

    const blockedDomains = []
    const domain = new URL(url).hostname

    if (blockedDomains.includes(domain)) {
      return res.status(400).json({ error: "Domain not allowed" })
    }

    next()
  } catch (error) {
    res.status(400).json({ error: "Invalid URL" })
  }
}

export default urlValidator
