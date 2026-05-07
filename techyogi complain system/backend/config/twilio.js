const twilio = require('twilio');

const getTwilioClient = () => {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

const sendSMS = async (to, message) => {
  try {
    const client = getTwilioClient();
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    return { success: true, response };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { getTwilioClient, sendSMS };
