import mongoose from 'mongoose';

export const isValidMongoId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

export const isValidDataId = (id = '123') => {
    const idString = id.toString();
    const regex = /^[0-9]{8}$/;

    return regex.test(idString);
};

const validatorMongoId = (req, res, next) => {
    const { id } = req.query;

    if (!isValidMongoId(id)) {
        return res.status(400).json({
            error: 'Tham số truy vấn không hợp lệ',
        });
    }

    next();
};

export const isNaN = (x) => {
    x = Number(x);
    return x != x;
};

const validatorCheckPages = (req, res, next) => {
    const { page } = req.query;

    if (!page) {
        return res.status(400).json({
            error: 'Tham số truy vấn không hợp lệ',
        });
    }

    const numberPage = Number(page);
    if (numberPage < 1 || typeof numberPage !== 'number' || isNaN(numberPage)) {
        return res.status(400).json({
            error: 'Tham số truy vấn không hợp lệ',
        });
    }

    req.page = numberPage;
    next();
};

const validatorAuthSearchKeyWord = (req, res, next) => {
    const { keyword } = req.query;

    if (!keyword) {
        return res.status(400).json({
            error: 'Vui lòng nhập từ khoá cần tìm kiếm',
        });
    }

    next();
};

export { validatorMongoId, validatorCheckPages, validatorAuthSearchKeyWord };
