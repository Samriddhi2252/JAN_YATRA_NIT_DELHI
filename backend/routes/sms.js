const express = require('express');
const router = express.Router();

// POST /api/sms/webhook - Handle incoming SMS queries (Feature Phone fallback)
router.post('/webhook', (req, res) => {
  const { Body, From } = req.body;
  const command = (Body || '').trim().toUpperCase();

  let smsResponse = '';

  if (command.includes('BUS 100 ETA')) {
    smsResponse = 'JAN YATRA SMS: Bus DL-01-PC-7788 (Delhi-Noida) is at Akshardham flyover. ML Predicted ETA to Sector 18: 15 mins. Speed: 52km/h.';
  } else if (command.includes('BOOK')) {
    const hash = 'JYQR-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    smsResponse = `JAN YATRA SMS: Pass Confirmed! Pass ID: ${hash}. Seat(s): 2 on Delhi-Noida Express. Total: Rs 90. Show SMS to conductor.`;
  } else {
    smsResponse = 'JAN YATRA SMS: Reply "BUS 100 ETA" for live bus position or "BOOK DELHI NOIDA 2" for instant ticket booking. Shortcode: 56161.';
  }

  res.type('text/xml').send(`
    <Response>
      <Message>${smsResponse}</Message>
    </Response>
  `);
});

module.exports = router;
