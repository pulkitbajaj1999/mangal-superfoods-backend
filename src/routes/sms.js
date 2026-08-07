import express from 'express';

import prisma from '../lib/prisma.js';

const router = express.Router();

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

router.post('/send', async (request, response) => {
  try {
    const { mobile } = request.body;

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return response.status(400).json({ error: 'Invalid mobile number' });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    let template = await prisma.otpTemplate.findUnique({ where: { key: 'LOGIN_OTP' } });
    if (!template) {
      template = await prisma.otpTemplate.create({
        data: {
          key: 'LOGIN_OTP',
          body: 'Your OTP for Mangal Superfoods is {{otp}}. It is valid for 5 minutes.',
        },
      });
    }

    const textMessage = template.body.replace('{{otp}}', otp);

    const whapiBase = process.env.WHAPI_BASE_URL;
    const whapiToken = process.env.WHAPI_TOKEN;

    if (!whapiToken) {
      return response.status(500).json({ error: 'SMS provider token not configured' });
    }

    const whapiResponse = await fetch(`${whapiBase}/messages/text`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${whapiToken}`,
      },
      body: JSON.stringify({ body: textMessage, to: `91${mobile}` }),
    });

    if (!whapiResponse.ok) {
      const errorBody = await whapiResponse.text();
      console.error('SMS provider error', whapiResponse.status, errorBody);
      return response.status(502).json({ error: 'Failed to send OTP via SMS provider' });
    }

    await prisma.otpCode.create({
      data: {
        mobile,
        code: otp,
        expiresAt,
      },
    });

    response.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('OTP send error', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verify', async (request, response) => {
  try {
    const { mobile, otp } = request.body;

    // Validate input
    if (!mobile || !otp) {
      return response.status(400).json({ success: false, error: 'Mobile and OTP are required' });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return response.status(400).json({ success: false, error: 'Invalid mobile format (must be 10 digits)' });
    }

    if (!/^\d{4}$/.test(otp)) {
      return response.status(400).json({ success: false, error: 'Invalid OTP format (must be 4 digits)' });
    }

    const existingOtp = await prisma.otpCode.findFirst({
      where: {
        mobile,
        code: otp,
        used: false,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!existingOtp) {
      return response.status(400).json({ success: false, error: 'OTP invalid or expired' });
    }

    await prisma.otpCode.update({
      where: { id: existingOtp.id },
      data: { used: true },
    });

    response.status(200).json({ success: true, message: 'OTP verified' });
  } catch (error) {
    console.error('OTP verify error', error);
    response.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
