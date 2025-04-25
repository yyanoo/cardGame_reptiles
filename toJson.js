import axios from 'axios';
import { load } from 'cheerio';
import { writeFile } from 'fs/promises';

let check = true;
const title = '02';

async function scrapeCardInfo(n) {
    try {
        const url = `https://ws-rose.com/cardlist/?cardno=OS${title}/R${title}-${n}`;
        const cardP = `https://ws-rose.com/wordpress/wp-content/images/cardlist/os${title}/r${title}/os${title}_r${title}_${n}.png`;

        const { data: html } = await axios.get(url);
        const $ = load(html);

        const cardNumber = $('dt:contains("カード番号")').next('dd').find('p').html();
        if (!cardNumber) {
            check = false;
        }
        const effect = $('dt:contains("テキスト")').next('dd').find('p').html();
        const effectList = effect.replace(/<br\s*\/?>/gi, '\n').trim();
        const [effect1, effect2, effect3] = effectList.split('\n');

        return {
            "卡號": cardNumber,
            "卡名": $('.item-Heading').text().trim(),
            "圖": cardP,
            "色": $('img.color').attr('alt'),
            "等級": $('dt:contains("レベル")').next('dd').find('p').html(),
            "費用": $('dt:contains("コスト")').next('dd').find('p').html(),
            "攻擊力": $('dt:contains("パワー")').next('dd').find('p').html(),
            "效果1": effect1,
            "效果2": effect2,
            "效果3": effect3
        };
    } catch (e) {
        check = false;
        return;
    }
}

async function scrapeAllCards() {
    const cards = [];

    for (let i = 1; check; i++) {
        const padded = String(i).padStart(3, '0');
        const card = await scrapeCardInfo(padded);
        if (card && check) cards.push(card);
    }

    await writeFile(`cards${title}.json`, JSON.stringify(cards, null, 2));
    console.log('done');
}

scrapeAllCards();
