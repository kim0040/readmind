const axios = require('axios');

async function verifyCaptcha(req, res, next) {
    const { captchaToken } = req.body;

    if (!captchaToken) {
        return res.status(400).json({ message: 'CAPTCHA token is required.' });
    }

    try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

        const response = await axios.post(verificationURL);
        const { success } = response.data;

        if (success) {
            next();
        } else {
            res.status(400).json({ message: 'Failed CAPTCHA verification.' });
        }
    } catch (error) {
        console.error('CAPTCHA verification error:', error.message);
        res.status(500).json({ message: 'Server error during CAPTCHA verification.' });
    }
}

module.exports = verifyCaptcha;
