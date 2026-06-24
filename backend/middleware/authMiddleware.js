const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const publicRoutes = [
        { path: '/api/mgmt/coupons/verify', method: 'POST' },
        { path: '/api/mgmt/feedback', method: 'POST' }
    ];

    const isPublic = publicRoutes.some(
        route => req.originalUrl.split('?')[0] === route.path && req.method === route.method
    );

    if (isPublic) {
        return next();
    }
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No Token Provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_robot_key_2026');
        req.user = decoded; // Contains id, role, email, etc.
        next();
    } catch (e) {
        return res.status(401).json({ success: false, message: 'Unauthorized Request.' });
    }
};

module.exports = authMiddleware;
