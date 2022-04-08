'use strict';

const kuromoji = require('kuromoji');
const express = require('express');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;

// Kuromoji.js の最初の宣言 ここだけ非同期
let tokenizer;
async function init() {
    tokenizer = await new Promise((resolve, reject) => {
        kuromoji
            .builder({ dicPath: 'node_modules/kuromoji/dict' })
            .build((err, tokenizer) => {
                if (err) reject(err)
                resolve(tokenizer)
            })
    })
}


function makeAnotherStory(tokens, ids, names){
    const story = [];// 配列をクリア

    tokens.forEach((token) => {
        console.log(token);
        const id = token.word_id;// IDを取り出す
        const find = ids.findINdex((elem)=>elem==id);// ID配列に追加する
        
    })
    
}



// LINE 設定

const config = {
    channelSecret: '********************************',
    channelAccessToken: '***************************'
};

// 以下サーバー設定

const app = express();

app.get('/', (req, res) => res.send('Hello LINE BOT!(GET)')); //ブラウザ確認用(無くても問題ない)
app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);

    //ここのif分はdeveloper consoleの"接続確認"用なので削除して問題ないです。
    if(req.body.events[0].replyToken === '00000000000000000000000000000000' && req.body.events[1].replyToken === 'ffffffffffffffffffffffffffffffff'){
        res.send('Hello LINE BOT!(POST)');
        console.log('疎通確認用');
        return; 
    }

    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result));
});

const client = new line.Client(config);

async function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    // 形態素解析の実行自体は非同期でなく同期的に即座に返される
    const res = tokenizer.tokenize(event.message.text);
    console.log(res[0].pos);
    console.log('ですよ');

    return client.replyMessage(event.replyToken, {
        type: 'text',
        // text: `こんなんでました:${JSON.stringify(res[0].pos,res[0].basic_form,null,"  ")}です`, //実際に返信の言葉を入れる箇所
        text: `こんなんでました:${JSON.stringify(id, null, "  ")}です`, //実際に返信の言葉を入れる箇所
    });
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);

init();