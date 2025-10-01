const axios = require('axios');

/**
 * reCAPTCHA 토큰을 검증한다. 개발 환경에서 키가 없으면 자동으로 우회한다.
 */
async function verifyCaptcha(req, res, next) {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const isProduction = process.env.NODE_ENV === 'production';
    const skipVerification = !secretKey || secretKey === 'YOUR_RECAPTCHA_SECRET_KEY' || !isProduction;

    if (skipVerification) {
        return next();
    }

    const { captchaToken } = req.body;

    if (!captchaToken) {
        return res.status(400).json({ message: 'CAPTCHA 토큰이 필요합니다.' });
    }

    try {
        const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

        const response = await axios.post(verificationURL);
        const { success } = response.data;

        if (success) {
            next();
        } else {
            res.status(400).json({ message: 'CAPTCHA 검증에 실패했습니다.' });
        }
    } catch (error) {
        console.error('CAPTCHA 검증 중 오류:', error.message);
        res.status(500).json({ message: 'CAPTCHA 검증 과정에서 서버 오류가 발생했습니다.' });
    }
}

module.exports = verifyCaptcha;
