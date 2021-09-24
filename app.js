const express = require("express");
// const router = express.Router();
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

// credential
const stripe = require("stripe")(
  "secret"
);

// const axios = require("axios")

// バックエンドサーバ立ち上げ
const server = app.listen(process.env.PORT || 8000, () => {
  console.log("Node.js is listening to PORT:" + server.address().port);
});

app.use(cors());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.options("*", (req, res) => {
  res.sendStatus(200);
});

// テスト用
app.get("/api/test", async (req, res) => {
  return res.send({
    message: "テストOK",
  });
});

// 顧客情報を作成
app.post("/api/stripe-create-customer", async (req, res) => {
  // エラーチェック
  try {
    // console.log(req.body);
    // let token = req.body.token
    let email = req.body.email;
    // let customerId = req.body.customerId;

    // エラー処理
    if (!email) {
      return res.send({
        message: "パラメータが足りません",
        customerId: "",
      });
    }
  } catch (error) {
    console.log("リクエストエラーです");
    return false;
  }

  // まず既存顧客かチェック
  try {
    let customerId = req.body.customerId;

    if (customerId) {
      const result = await stripe.customers.retrieve(customerId);
      // console.log(result);

      return res.send({
        message: "すでに顧客情報が存在します",
        customerId: result.id,
      });
    }
  } catch (error) {
    console.log("顧客情報ありません");
  }

  // 顧客情報作成
  try {
    let email = req.body.email;

    // 顧客情報作成
    const result = await stripe.customers.create({
      email: email,
    });

    // console.log("result", result);

    return res.send({
      message: "Created a customer.",
      customerId: result.id,
    });
  } catch (error) {
    return res.send({
      message: "Errorです.",
      customerId: "customerId",
    });
  }
});

// 顧客のクレジットカード情報を作成
app.post("/api/stripe-create-card", async (req, res) => {
  let result = {};

  // まずカード情報あるか
  try {
    const listSources = async (customerId, options) => {
      return await stripe.customers.listSources(customerId, options);
    };
    const result = await listSources(req.body.customerId, { object: "card" });
    console.log("既存カードリスト");
    console.log(result);

    if (result.data.length > 0) {
      return res.send({
        message: "カードは１枚しか登録できません",
        customerId: "",
      });
    }
  } catch (error) {
    console.log("カード情報が取得できません");
  }

  try {
    // console.log(req.body);

    // let token = req.body.token
    const customerId = req.body.customerId;
    const card = {
      number: req.body.number,
      expMonth: req.body.expMonth,
      expYear: req.body.expYear,
      cvc: req.body.cvc,
    };

    // エラー処理
    if (!customerId) {
      return res.send({
        message: "顧客IDパラメータが足りません",
        customerId: "",
      });
    }

    // エラー処理
    if (!card.number || !card.expMonth || !card.expYear || !card.cvc) {
      return res.send({
        message: "カードパラメータが足りません",
        customerId: "",
      });
    }

    const cardCreateAfter = async (token) => {
      console.log("cardCreateAfter");
      console.log(token);
      // asynchronously called
      const params = {
        source: token.id,
      };
      console.log(params);

      return await stripe.customers.createSource(customerId, params);
    };

    // cardCreateAfter()

    // eslint-disable-next-line no-unused-vars
    const getToken = async () => {
      // console.log(card);
      const token = await stripe.tokens.create({
        card: {
          number: card.number,
          exp_month: parseInt(card.expMonth),
          exp_year: parseInt(card.expYear),
          cvc: card.cvc,
        },
      });
      return token;
    };

    const token = await getToken();
    // console.log(token);

    const cardCreateRes = await cardCreateAfter(token);
    console.log(cardCreateRes);

    result = cardCreateRes;

    console.log("結果");
    console.log(result);

    return res.send({
      message: "Created a card.",
      customerId: result.customer,
    });
  } catch (error) {
    console.log(error);
    return res.send({
      message: "Errorです.",
      customerId: "",
    });
  }
});

// 支払い実行
app.post("/api/stripe-charge", async (req, res) => {
  try {
    // console.log(req.body);
    const customerId = req.body.customerId;
    const amount = req.body.amount;

    // エラー処理
    if (!customerId || !amount) {
      return res.send({
        message: "パラメータが足りません",
        customerId: "customerId",
      });
    }

    // eslint-disable-next-line no-unused-vars
    const charge = await stripe.charges.create({
      amount: amount,
      currency: "jpy",
      description: "description",
      customer: customerId,
    });

    console.log("支払い実行");
    console.log(charge);

    return res.send({
      message: "Created a charge.",
      customerId: customerId,
    });
  } catch (error) {
    return res.send({
      message: "Errorです.",
      customerId: "",
    });
  }
});
