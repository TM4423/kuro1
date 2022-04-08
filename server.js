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




// LINE 設定

const config = {
    channelSecret: '',
    channelAccessToken: ''
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

    const names = [];  //名詞を格納する配列
    
    // 形態素解析の実行自体は非同期でなく同期的に即座に返される
    const res = tokenizer.tokenize(event.message.text);

    // ここから名詞だけを取り出す
    res.forEach((word)=>{
        console.log('＝＝＝＝'+word);
        if(word.pos == '名詞' && word.pos_detail_1 == "一般"){
            names.push(word.word_surface_form);
        }
    });

    // もとに戻す
    console.log(res);
    // console.log(res);
    // return client.replyMessage(event.replyToken, {
    //     type: 'text',
    //     // text: `こんなんでました:${names,null,"  "}です`, //実際に返信の言葉を入れる箇所
    //     text: `こんなんでました:${JSON.stringify(res,null,"  ")}です`, //実際に返信の言葉を入れる箇所
    //     // text: `こんなんでました:${JSON.stringify(res,null,"  ")}です`, //実際に返信の言葉を入れる箇所
    // });
    return client.replyMessage(event.replyToken, 'slkdjfslkdjfljdlfj l');
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);
// (process.env.NOW_REGION) ? module.exports = app : app.listen(PORT); //Vercelへデプロイするとき、前2行をコメントアウトして、この2行を生かす
// console.log(`Server running at ${PORT}`);

init();