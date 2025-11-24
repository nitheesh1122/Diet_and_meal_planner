const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const Admin = require('../models/Admin');

exports.protectAdmin = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.admin = await Admin.findById(decoded.id);

        if (!req.admin) {
            return next(new ErrorResponse('No admin found with this id', 404));
        }

        next();
    } catch (error) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
};

exports.requireSuperAdmin = (req, res, next) => {
    if (!req.admin || req.admin.role !== 'super') {
        return next(new ErrorResponse('Super admin privilege required', 403));
    }
    next();
};