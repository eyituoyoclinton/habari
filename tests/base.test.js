const supertest = require('supertest');
const httpStatus = require('http-status');

const app = require('../src/app');
const request = supertest(app);

describe('Fetch transactions', () => {
   test('transaction list', async () => {
      const response = await request.get('/v1/').send();

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body.message).toBe('transaction list');
   });
});

describe('Fetch available balance', () => {
   test('transaction list', async () => {
      const response = await request.get('/v1/?component=available_balance').send();

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body.message).toBe('Available balance');
   });
});
describe('Fetch pending balance', () => {
   test('transaction list', async () => {
      const response = await request.get('/v1/?component=pending_settlement').send();

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body.message).toBe('Pending balance');
   });
});

describe('Payment with VA', () => {
   test('Virtual Account payment', async () => {
      const response = await request.post('/v1/payment').send({
         "amount": "4000", "description": "For starlink subscription",
         "fullname": "Clinton Emiko",
         "expiration_date": "11/25",
         "card_number": "4444 6666 7777 4444",
         "cvv": "333",
         "currency": "NGN",
         "account_number": "2030503733",
         "bank_code": "033",
         "reference": "1715GFEMUQL3"
      });

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body.message).toBe('Your payment was successful');
   });
});
describe('Payment with card', () => {
   test('card payment', async () => {
      const response = await request.post('/v1/payment').send({
         "amount": "4000", "description": "For starlink subscription",
         "fullname": "Clinton Emiko",
         "expiration_date": "11/25",
         "card_number": "4444 6666 7777 4444",
         "cvv": "333",
         "currency": "NGN",
         "reference": "WE0R5HG6DU0M"
      });

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body.message).toBe('Your payment was successful with card');
   });
});

describe('Update Payment with card', () => {
   test('Update card payment', async () => {
      const response = await request.put('/v1/update-card').send({
         "amount": "4000",
         "card_number": "4444 6666 7777 4444",
         "currency": "NGN",
         "reference": "8FM7WLVBEMH2"
      });

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body.message).toBe('Card payment was updated without error');
   });
});

describe('Payout', () => {
   test('Payout', async () => {
      const response = await request.put('/v1/payout').send();

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body.message).toBe('Payout was successful');
   });
});
