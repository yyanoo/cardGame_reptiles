import axios from "axios";
import { load } from "cheerio";
import { writeFile } from 'fs/promises';


async function scrapeCardInfo_holo(n) {
    try{
        const url = `https://hololive-official-cardgame.com/cardlist/?id=${n}`
        const {data:html} = await axios.get(url);
        const $ = load(html);

        const cardId = $('p.number > span').text().trim();
        if(!cardId){
            return null;
        }

        const cardImg = $('.img').find('img').attr('src')
        const cardType = $('dt:contains("カードタイプ")').next('dd').text().trim();


        const cardArts = [];

        if(cardType === 'ホロメン'){
            $('.sp.arts').each((i, el) => {
              const block = $(el).find('p').eq(1);
              const arts = block.find('span').first().text().trim();
            
              const fullText = block.text().trim();
              const description = fullText.replace(arts, '').trim();
    
              if(!description){
                cardArts.push({
                    arts
                })
              }else{
                cardArts.push({
                    arts,
                    description
                })
              };
    
            });

        }else if(cardType === '推しホロメン'){

            function skill(target){
                const block = $(target).find('p').eq(1).text().trim();

                const costMatch = block.match(/^\[.*?\]/);  // 開頭的 [xxx]
                const cost = costMatch ? costMatch[0] : '';
                const rest = cost ? block.replace(cost, '') : block;
            
                const effectMatch = rest.match(/\[.*?\]/); // 名字後的 [xxx]
                const effectCondition = effectMatch ? effectMatch[0] : '';
                const nameAndEffect = rest.split(effectCondition);
                const name = nameAndEffect[0] || '';
                const effect = effectCondition + (nameAndEffect[1] || '');

                return {
                    cost,
                    name: name.trim(),
                    effect: effect.trim()
                };
            }

            cardArts.push({
                oshiSkill:skill('.oshi.skill'),
                spSkill:skill('.sp.skill')
            })

        }else{
            function skill(){
                const effect = $('dt:contains("能力テキスト")').next('dd').html();

                const effectList = effect
                .replace(/<br\s*\/?>/gi, '\n') // <br> 換成換行
                .trim()
                .split('\n') // 按換行分割
                .filter(line => line.trim() !== ''); // 過濾掉空白行

                return{
                    effect:effectList
                }
            }

            cardArts.push({ ...skill()});
        }

        return{
            cardId,
            "Id":n,
            "cardImg":`https://hololive-official-cardgame.com${cardImg}`,
            cardType,
            cardArts
        }

    }catch(e){
        return null;
    }
}

async function scrapeAllCards() {
    const cards = [];
    console.log('strat')

    for (let i = 1; ; i++) {
        const card = await scrapeCardInfo_holo(i);
        if (!cards) break;
        cards.push(card);
    }

    await writeFile(`cards.json`, JSON.stringify(cards, null, 2));
    console.log('done');
}

scrapeAllCards()
