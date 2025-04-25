import axios from 'axios';
import { load } from 'cheerio';

async function scrapeCardInfo(n) {
    try {
        const title = '01';
        const url = `https://ws-rose.com/cardlist/?cardno=OS${title}/R${title}-${n}`; 
        const cardP = `https://ws-rose.com/wordpress/wp-content/images/cardlist/os${title}/r${title}/os${title}_r${title}_${n}.png`

        const { data: html } = await axios.get(url);
        const $ = load(html);

        const cardNumber = $('dt:contains("カード番号")').next('dd').find('p').html();
        const cardName = $('.item-Heading').text().trim();
        const color = $('img.color');
        const cardLvl = $('dt:contains("レベル")').next('dd').find('p').html();
        const cost = $('dt:contains("コスト")').next('dd').find('p').html();
        const power = $('dt:contains("パワー")').next('dd').find('p').html();

        const effect = $('dt:contains("テキスト")').next('dd').find('p').html();
        const effectList = effect.replace(/<br\s*\/?>/gi, '/n').trim();
        const [effect1,effect2,effect3] = effectList.split('/n',3);

        const cardInfo = {
            "卡號": cardNumber,
            "卡名": cardName,
            "圖": cardP,
            "色": color.attr('alt'),
            "等級": cardLvl,
            "費用": cost,
            "攻擊力": power,
            "效果1": effect1,
            "效果2": effect2,
            "效果3": effect3
        };
        console.log(cardInfo);
    } catch (e) {
        console.log(e.message);
    }
}

scrapeCardInfo('020')
