const checkStatusCharing = (data, desc) => {
    let message, status, description;

    switch (data) {
        case 1:
            status = 1;
            message = 'Thẻ đúng';
            description = desc;
            break;
        case 2:
            status = 2;
            message = 'Sai mệnh giá';
            description = desc;
            break;
        case 3:
            status = 3;
            message = 'Thẻ lỗi';
            description = 'INVALID_CARD';
            break;
        case 4:
            status = 4;
            message = 'Bảo trì';
            description = desc;
            break;
        case 99:
            status = 99;
            message = 'Đang xử lý';
            description = desc;
            break;
        case 102:
            status = 102;
            message = 'Lỗi API';
            description = 'Đối tác đổi thẻ không tồn tại hoặc đã bị tắt nên thẻ chưa được xử lý';
            break;
        case 400:
            status = 400;
            message = 'SPAM';
            description = desc;
            break;
        case 100:
            status = 100;
            message = 'Lỗi gửi thẻ';
            description = desc;
            break;
        default:
            status = 100;
            message = 'Lỗi gửi thẻ';
            description = 'Lỗi gửi thẻ do đối tác đã tắt hoặc chặn không cho xử lý thẻ';
    }

    return {
        status,
        message,
        description,
    };
};

export { checkStatusCharing };
