const express = require('express');
const helpers = require('./utils/helpers');
const db = require('./db');
const router = express.Router();

router.route('/').get(async (req, res, next) => {
   let query = req.query
   let component = helpers.getInputValueString(query, 'component')
   try {
      if (component) {
         if (component === 'available_balance') {
            const result = await db.query('SELECT sum(amount_settle) FROM transactions WHERE setlement_status=1');

            return res.status(200).send({
               success: true,
               message: "Available balance",
               data: result.rows && result.rows[0],
            });
         }
         if (component === 'pending_settlement') {
            const result = await db.query('SELECT sum(amount) FROM transactions WHERE setlement_status=0');
            return res.status(200).send({
               success: true,
               message: "Pending balance",
               data: result.rows && result.rows[0],
            });
         }
      }
      const result = await db.query('SELECT * FROM transactions');
      return res.status(200).send({
         success: true,
         message: "transaction list",
         data: result.rows,
      });
   } catch (err) {
      console.error(err);
      return res.status(500).send({
         success: false,
         message: "Internal Server Error",
         data: {},
      });
   }

});

//payment api for both card and virtaul account
router.route('/payment').post(async (req, res, next) => {
   let body = req.body;
   let amount = helpers.getInputValueString(body, 'amount')
   let description = helpers.getInputValueString(body, 'description')
   let fullname = helpers.getInputValueString(body, 'fullname')
   let expirationDate = helpers.getInputValueString(body, 'expiration_date')
   let cardNumber = helpers.getInputValueString(body, 'card_number')
   let cvv = helpers.getInputValueString(body, 'cvv')
   let currency = helpers.getInputValueString(body, 'currency')
   let accountNumber = helpers.getInputValueString(body, 'account_number')
   let bankCode = helpers.getInputValueString(body, 'bank_code')

   if (!amount || !description || !fullname || !currency) {
      return res.status(406).send({
         success: false,
         message: "One or more paramenters is missing (amount, description, fullname, currency)",
         data: {}
      })
   }
   //validate amount
   if (amount) {
      // if (!/^\d+$/.test(amount)) {
      if (!amount.match(/^[\d.]+$/)) {
         return res.status(406).send({
            success: false,
            message: "invalid amount. value must be a number",
            data: {}
         })
      }
   }
   //validate description
   if (description) {
      if (description.length < 2 || description.length > 50) {
         return res.status(406).send({
            success: false,
            message: "description should be between 2 to 50 characters",
            data: {}
         })
      }
   }
   //validate the fullname/ cardholder
   if (fullname) {
      if (fullname.length < 2 || fullname.length > 50) {
         return res.status(406).send({
            success: false,
            message: "fullname/cardholder should be between 2 to 50 characters",
            data: {}
         })
      }
      if (!/^[a-z\- ]+$/i.test(fullname)) {
         return res.status(406).send({
            success: false,
            message: "Special character is not allowed in the fullname/cardholder",
            data: {}
         })
      }
   }
   //validate expiration date
   if (expirationDate) {
      if (!/^([0-9]{2})\/([0-9]{2})$/.test(expirationDate)) {
         return res.status(406).send({
            success: false,
            message: "Invalid expiration date. must be in the formate MM-YY",
            data: {}
         })
      }
      const d = new Date();
      let currentMonth = d.getMonth() + 1;
      let currentYear = d.getFullYear();
      //split expiration date
      let splitDate = expirationDate.split('/')
      if ('20' + splitDate[1] < currentYear) {
         return res.status(406).send({
            success: false,
            message: "It looks like your card has expired, please try another card",
            data: {}
         })
      }
      if (splitDate[0] < currentMonth && '20' + splitDate[1] <= currentYear) {
         return res.status(406).send({
            success: false,
            message: "It looks like your card has expired, please try another card",
            data: {}
         })
      }

   }
   //validate card number
   if (cardNumber) {
      let nCardNumber = cardNumber.replaceAll(' ', '')
      if (!nCardNumber.match(/^[\d]+$/)) {
         return res.status(406).send({
            success: false,
            message: "invalid card numbers. value must be a number",
            data: {}
         })
      }
      if (nCardNumber.length !== 16) {
         return res.status(406).send({
            success: false,
            message: "invalid card numbers. value must be 16 digits",
            data: {}
         })
      }
   }
   //validate cvv
   if (cvv) {
      if (!cvv.match(/^[\d]+$/)) {
         return res.status(406).send({
            success: false,
            message: "invalid cvv. value must be a number",
            data: {}
         })
      }
      if (cvv.length !== 3) {
         return res.status(406).send({
            success: false,
            message: "invalid cvv. value must be 3 digits",
            data: {}
         })
      }
   }
   //validate currency
   if (currency) {
      if (['NGN', "USD"].indexOf(currency) === -1) {
         return res.status(406).send({
            success: false,
            message: "Currency is not valid",
            data: {}
         })
      }
   }
   //validate account number
   if (accountNumber) {
      if (!accountNumber.match(/^[\d]+$/)) {
         return res.status(406).send({
            success: false,
            message: "invalid account number. value must be a number",
            data: {}
         })
      }
      if (accountNumber.length !== 10) {
         return res.status(406).send({
            success: false,
            message: "invalid account number. value must be 10 digits",
            data: {}
         })
      }
   }
   //validate bank code
   if (bankCode) {
      if (bankCode.length < 3) {
         return res.status(406).send({
            success: false,
            message: "invalid bank code. value must not be less than 3",
            data: {}
         })
      }
      //we can make a request with the bank code and account number to verify it too
   }
   let reference = helpers.generateReferenceCode(12)

   //submit it to database
   if (bankCode && accountNumber) {
      //virtual account submition
      // fee = 5%
      // va for virtual account
      // card for card payment

      try {
         const result = await db.query(`INSERT INTO transactions (amount, amount_settle,  description, account_name, account_number, bank_code, currency, transaction_type, reference, status, fee) VALUES(${amount}, 0, '${description}', '${fullname}', '${accountNumber}', '${bankCode}', '${currency}', 'va', '${reference}', 'success', '5' )`);

         return res.status(200).send({
            success: true,
            message: "Your payment was successful",
            data: { 'reference': reference },
         });

      } catch (err) {
         console.error(err);
         return res.status(500).send({
            success: false,
            message: "There was an error please try again",
            data: {},
         });
      }

   } else {
      //card transaction
      // fee = 3%
      let lastDigit = cardNumber.slice(-4)
      try {
         const result = await db.query(`INSERT INTO transactions (amount, amount_settle, description, account_name, card_number, cvv, currency, transaction_type, reference, status, fee, expiration_date) VALUES(${amount}, 0, '${description}', '${fullname}', '${lastDigit}', '${cvv}', '${currency}', 'card', '${reference}', 'pending', '3', '${expirationDate}' )`);

         return res.status(200).send({
            success: true,
            message: "Your payment was successful with card",
            data: { 'reference': reference },
         });

      } catch (err) {
         console.error(err);
         return res.status(500).send({
            success: false,
            message: "There was an error please try again",
            data: {},
         });
      }
   }

});

//route to update card payment from the card processor
router.route('/update-card').put(async (req, res, next) => {
   let body = req.body;
   let amount = helpers.getInputValueString(body, 'amount')
   let cardNumber = helpers.getInputValueString(body, 'card_number')
   let reference = helpers.getInputValueString(body, 'reference')
   let currency = helpers.getInputValueString(body, 'currency')

   if (!amount || !cardNumber || !reference || !currency) {
      return res.status(406).send({
         success: false,
         message: "One or more paramenters is missing (amount, card_number, reference, currency)",
         data: {}
      })
   }

   if (amount) {
      // if (!/^\d+$/.test(amount)) {
      if (!amount.match(/^[\d.]+$/)) {
         return res.status(406).send({
            success: false,
            message: "invalid amount. value must be a number",
            data: {}
         })
      }
   }

   if (cardNumber) {
      let nCardNumber = cardNumber.replaceAll(' ', '')
      if (!nCardNumber.match(/^[\d]+$/)) {
         return res.status(406).send({
            success: false,
            message: "invalid card numbers. value must be a number",
            data: {}
         })
      }
      if (nCardNumber.length !== 16) {
         return res.status(406).send({
            success: false,
            message: "invalid card numbers. value must be 16 digits",
            data: {}
         })
      }
   }
   if (currency) {
      if (['NGN', "USD"].indexOf(currency) === -1) {
         return res.status(406).send({
            success: false,
            message: "Currency is not valid",
            data: {}
         })
      }
   }
   if (reference) {
      if (reference.length !== 12) {
         return res.status(406).send({
            success: false,
            message: "reference is not valid",
            data: {}
         })
      }
   }

   //fetch with reference
   let result = {}
   try {
      result = await db.query(`SELECT * FROM transactions WHERE reference='${reference}' AND transaction_type='card' AND status='pending'`);
   } catch (err) {
      console.error(err);
      return res.status(500).send({
         success: false,
         message: "Internal Server Error",
         data: {},
      });
   }
   if (result && result.rows.length > 0) {
      let data = result.rows[0]
      if (data.amount !== parseFloat(amount)) {
         return res.status(404).send({
            success: false,
            message: "Amount does not match with the initiated amount",
            data: {},
         });
      }
      if (data.currency !== currency) {
         return res.status(404).send({
            success: false,
            message: "Currency does not match with the initiated currency",
            data: {},
         });
      }
      if (data.card_number !== cardNumber.slice(-4)) {
         return res.status(404).send({
            success: false,
            message: "card number does not match with the initiated card number",
            data: {},
         });
      }
      //update the status of the card transaction
      try {
         let result = await db.query(`UPDATE transactions SET status='success' WHERE reference='${reference}'`);
         return res.status(200).send({
            success: "success",
            message: "Card payment was updated without error",
            data: {},
         });
      } catch (err) {
         console.error(err);
         return res.status(500).send({
            success: false,
            message: "Internal Server Error",
            data: {},
         });
      }
   } else {
      return res.status(404).send({
         success: false,
         message: "Reference might be invalid",
         data: {},
      });
   }
})
//payout
router.route('/payout').put(async (req, res, next) => {
   let result = {}
   try {
      result = await db.query(`SELECT * FROM transactions WHERE setlement_status=0 AND status='success'`);
   } catch (err) {
      console.error(err);
      return res.status(500).send({
         success: false,
         message: "Internal Server Error",
         data: {},
      });
   }

   if (result && result.rows.length > 0) {
      //update the status of the payout transaction
      for (let pay of result.rows) {
         //get the settlement amount after removing the % fee
         let settledAmount = (pay.amount - (pay.amount * (pay.fee / 100))).toFixed(2)
         try {
            let result = await db.query(`UPDATE transactions SET amount_settle=${settledAmount}, setlement_status=1 WHERE id='${pay.id}'`);

         } catch (err) {
            console.error(err);
            return res.status(500).send({
               success: false,
               message: "Internal Server Error",
               data: {},
            });
         }
      }
      return res.status(200).send({
         success: true,
         message: "Payout was successful",
         data: {},
      });
   } else {
      return res.status(200).send({
         success: true,
         message: "No payout today",
         data: {},
      });
   }
})

//route to create payout
module.exports = router;