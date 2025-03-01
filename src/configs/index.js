import moment from 'moment';
import express from 'express';
import { dirname, join } from 'path';
import { appendFile, existsSync, mkdirSync } from 'fs';

export const configViewEngine = (app) => {
    app.use(express.static('./src/public'));
    app.set('view engine', 'ejs');
    app.set('views', './src/views');
};

// Hàm tạo số ngẫu nhiên
export function generateRandomNumber(minLength, maxLength) {
    let length;

    // Kiểm tra nếu minLength và maxLength giống nhau
    if (minLength === maxLength) {
        length = minLength;
    } else {
        // Nếu không giống nhau, chọn một giá trị ngẫu nhiên trong khoảng
        length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    }

    // Đảm bảo số đầu tiên không phải là 0
    let randomNumber = (Math.floor(Math.random() * 9) + 1).toString();

    // Tạo phần giữa của số
    for (let i = 1; i < length - 1; i++) {
        randomNumber += Math.floor(Math.random() * 10).toString();
    }

    // Đảm bảo số cuối cùng không phải là 0
    randomNumber += (Math.floor(Math.random() * 9) + 1).toString();

    // Chuyển chuỗi thành số nguyên
    return parseInt(randomNumber, 10);
}

// Hàm định dạng số tiền 100.000đ
export const convertCurrency = (number) => {
    if (number == null || number === undefined) {
        return 'Null';
    }

    const amount = Number(number);
    let check = typeof amount === 'number' ? true : false;

    return check ? amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ' : 'Null';
};

// Hàm để xử lý URL database
export function configProcessImageUrlDatabase(imageName) {
    if (!imageName) {
        return '';
    }

    if (imageName.startsWith('http')) {
        return imageName;
    } else {
        return `http://localhost:8080/images/${imageName}`;
    }
}

// Ghi log
export const configCreateLog = (fileName, func, message) => {
    // Đường dẫn đầy đủ đến tập tin log
    const filePath = join('src/log', fileName);

    // Đảm bảo thư mục chứa file log tồn tại
    const logDirectory = dirname(filePath);
    if (!existsSync(logDirectory)) {
        mkdirSync(logDirectory, { recursive: true });
    }

    // Ghi thông điệp lỗi vào tập tin
    const messageLog = `${moment(new Date()).format('YYYY-MM-DD HH:mm:ss')} - ${func}() - ${message}\n`;
    appendFile(filePath, messageLog, (err) => {
        if (err) {
            console.log(`Lỗi ghi vào tập tin ${fileName}:`, err);
        }
    });
};

export const configGetDiscountRulePartner = (serviceUsed, rules) => {
    let applicableDiscount = 0;

    for (const rule of rules) {
        if (serviceUsed >= rule.service) {
            applicableDiscount = rule.discount;
        }
    }

    return applicableDiscount;
};
