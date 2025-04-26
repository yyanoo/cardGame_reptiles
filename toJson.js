import axios from 'axios';
import { load } from 'cheerio';
import { writeFile } from 'fs/promises';

const title = ''; //系列號  OS{title}/R{title}-{n}

//抓資料
async function scrapeCardInfo(n) {
    try {
        const url = `https://ws-rose.com/cardlist/?cardno=OS${title}/R${title}-${n}`;
        const { data: html } = await axios.get(url);
        const $ = load(html);

        //判斷是否有該卡號
        const cardId = pdd('dt:contains("カード番号")');
        if (!cardId) {
            console.error(`Error at card OS01/R01-${n}:`, e.message);
            return null;
        }

        //一般 dd 裏的 p
        function pdd(target) {
            return $(target)
                .next('dd')
                .find('p')
                .html();
        }

        //顔色+魂刻 alt
        function img(target) {
            return $(target)
                .next('dd')
                .find('img')
                .map((i, el) => $(el).attr('alt'))
                .get();
        }
        
        //卡名
        const cardName = $('.item-Heading')
            .contents()
            .not('span')
            .text()
            .trim()

        //魂刻
        const soul = String($('dt:contains("ソウル")')
            .next('dd')
            .find('img')
            .length);

        //效果br
        const effect = $('dt:contains("テキスト")').next('dd').find('p').html();
        const effectList = effect.replace(/<br\s*\/?>/gi, '\n').trim();
        const [effect1, effect2, effect3] = effectList.split('\n');

        //回傳資料
        return{
            "卡號": cardId,
            "卡名": cardName,
            "圖": `https://ws-rose.com/wordpress/wp-content/images/cardlist/os${title}/r${title}/os${title}_r${title}_${n}.png`,
            "色": img('dt:contains("色")'),
            "判定": img('dt:contains("トリガー")'),
            "等級": pdd('dt:contains("レベル")'),
            "費用": pdd('dt:contains("コスト")'),
            "攻擊力": pdd('dt:contains("パワー")'),
            "魂": soul,
            "效果1": effect1,
            "效果2": effect2,
            "效果3": effect3
        }
    } catch (e) {
        console.error(`Error at card OS01/R01-${n}:`, e.message);
        return null;
    }
}

//資料存cards轉Json 更改系列到上 title

async function scrapeAllCards() {
    const cards = [];

    for (let i = 1; ; i++) {
        const padded = String(i).padStart(3, '0');
        const card = await scrapeCardInfo(padded);
        if (!card) break;
        cards.push(card);
    }

    await writeFile(`cards${title}.json`, JSON.stringify(cards, null, 2));
    console.log('done');
}

scrapeAllCards();
