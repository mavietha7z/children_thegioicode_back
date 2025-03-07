// Tính thời gian hết hạn
const serverUserCalculateExpired = (created_at, cycles_unit, cycles_value) => {
    try {
        let expired_at = new Date(created_at);

        switch (cycles_unit) {
            case 'months':
                expired_at.setMonth(expired_at.getMonth() + cycles_value);
                break;
            case 'years':
                expired_at.setFullYear(expired_at.getFullYear() + cycles_value);
                break;
            case 'forever':
                expired_at = new Date('9999-12-31');
                break;
            default:
                throw new Error('Đơn vị thời gian không hợp lệ');
        }

        expired_at.setHours(23, 59, 59, 999);

        return expired_at;
    } catch (error) {
        return null;
    }
};

// Tính số ngày còn lại cho gói dịch vụ
const serviceCalculateRemainingDays = (expirationDate) => {
    const currentDate = new Date();
    const expireDate = new Date(expirationDate);

    const timeDifference = expireDate - currentDate;
    const remainingDays = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    return remainingDays;
};

// Tính số ngày trong tháng
function serviceGetDaysInCurrentMonth() {
    // Lấy ngày hiện tại
    const currentDate = new Date();

    // Lấy năm và tháng hiện tại
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0 (0 = tháng 1)

    // Tạo một ngày mới với tháng tiếp theo và ngày là 0
    // Điều này sẽ trả về ngày cuối cùng của tháng trước đó
    const lastDayOfMonth = new Date(year, month, 0);

    // Lấy số ngày trong tháng
    return lastDayOfMonth.getDate();
}

// Tính số tiền cần trả để nâng cấp dịch vụ
function serviceCalculateUpgradeCost(oldPrice, newPrice, remainingDays, daysInMonth) {
    // Tính giá trị còn lại của gói cũ
    const oldPackageValue = (oldPrice / daysInMonth) * remainingDays;

    // Tính giá trị của gói mới cho số ngày còn lại
    const newPackageValue = (newPrice / daysInMonth) * remainingDays;

    // Tính số tiền phải trả để nâng cấp
    const upgradeCost = newPackageValue - oldPackageValue;

    return Math.round(upgradeCost);
}

// Tính % thời còn lại trong tháng
function serviceCalculateRemainingRatio(remainingDays, daysInMonth) {
    // Tính tỷ lệ thời gian còn lại (kiểu 0,%)
    const remainingRatio = remainingDays / daysInMonth;

    // Làm tròn đến 4 chữ số thập phân (nếu cần)
    return parseFloat(remainingRatio.toFixed(2));
}

export {
    serverUserCalculateExpired,
    serviceCalculateUpgradeCost,
    serviceGetDaysInCurrentMonth,
    serviceCalculateRemainingDays,
    serviceCalculateRemainingRatio,
};
