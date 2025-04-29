const API_KEYS = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];

const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
        return res.status(401).json({
            code: 401,
            msg: 'API key is required',
            data: null
        });
    }

    if (!API_KEYS.includes(apiKey)) {
        return res.status(403).json({
            code: 403,
            msg: 'Invalid API key',
            data: null
        });
    }

    next();
};

module.exports = {
    validateApiKey
}; 