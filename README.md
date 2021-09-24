# public_test_stripe

## 【公開用】 Stripe 決済を実装したサーバサイドアプリケーション

### 使用技術

- いったん js（not ts）
- ES6
- node（v15）
- express（node server）
- Stripe API

# 説明

API サーバ立ち上げ

```
node app.js
```

### 顧客情報の作成

POST  
http://localhost:8000/stripe-create-customer

```
{
    email: "test@test.com"
}
```

```
curl --location --request POST 'http://localhost:8000/stripe-create-customer' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "test@test.com"
}'
```

### 顧客クレジットカード情報の作成

POST  
http://localhost:8000/stripe-create-card

```
{
    "customerId": "cus_hoge",
    "cardNumber": "4242424242424242",
    "expMonth": "12",
    "expYearber": "2030",
    "cvc": "123"
}
```

```
curl --location --request POST 'http://localhost:8000/stripe-create-card' \
--header 'Content-Type: application/json' \
--data-raw '{
    "customerId": "cus_hoge",
    "cardNumber": "4242424242424242",
    "cardExpMonth": "12",
    "cardExpYear": "2030",
    "cvc": "123"
}'
```

「顧客情報の作成」で GET した顧客 ID

### 支払い実行

POST  
http://localhost:8000/stripe-charge

```
{
    "customerId": "cus_hoge",
    "amount": 10000
}
```

```
curl --location --request POST 'http://localhost:8000/stripe-charge' \
--header 'Content-Type: application/json' \
--data-raw '{
    "customerId": "cus_hoge",
    "amount": 10000
}'
```

「顧客情報の作成」で GET した顧客 ID

### memo

なし
