import axios from "axios";
import { load } from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const fliename = fileURLToPath(import.meta.url);
const dir = path.dirname(fliename);

const link = `https://ws-tcg.com/todays-card/`;

async function getCard() {
  const { data: html } = await axios.get(link);
  const $ = load(html);

  const imgCards = [];
  $("img.aligncenter").each((index, element) => {
    const imgSrc = $(element).attr("src");
    if (imgSrc) {
      imgCards.push(new URL(imgSrc, link).href);
    }
  });

  const imgdir = path.join(dir, "img");
  if (!fs.existsSync(imgdir)) {
    fs.mkdirSync(imgdir);
  }

  for (let i = 0; i < imgCards.length; i++) {
    const imgUrl = imgCards[i];
    const imgName = path.basename(new URL(imgUrl).pathname);
    const imgPath = path.join(imgdir,imgName)

    const writer = fs.createWriteStream(imgPath);

    const response = await axios({
      url: imgUrl,
      method: "get",
      responseType: "stream",
    });

    response.data.pipe(writer);

    console.log(`已下載${imgName}`)
  }
  
}

getCard();
