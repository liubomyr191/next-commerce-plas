import * as cheerio from 'cheerio';
import * as Cors from 'cors';

const cors = Cors({
  methods: ['POST'],
})

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default async function getPrice(req, res) {
  await runMiddleware(req, res, cors)
  if (req.method === "POST") {
    const asin = req.body.ASIN;

    try {
      const response = await fetch(`https://www.amazon.com/dp/${asin}`);
      const htmlString = await response.text();
      const $ = cheerio.load(htmlString);
      const price = $('.apexPriceToPay').text();

      res.statusCode = 200;
      return res.json({
        price: price,
        html: htmlString,
      });
    } catch (e) {
      res.statusCode = 404;
      return res.json({
        error: `Price for item ${asin} is not found.`,
      });
    }
  }
}