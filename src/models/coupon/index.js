import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const couponSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        immutable: true,
    },
    apply_services: [
        {
            type: Schema.Types.ObjectId,
            refPath: 'service_type',
        },
    ],
    service_type: {
        type: String,
        enum: ['Source', 'CloudServerProduct', 'Template'],
        required: true,
    },
    code: {
        type: String,
        unique: true,
        required: true,
    },
    discount_type: {
        type: String,
        enum: ['percentage', 'fixed'], // Loại giảm giá: theo % hoặc giá trị cố định
        required: true,
    },
    discount_value: {
        type: Number,
        min: 1,
        required: true, // Giá trị giảm giá (ví dụ: 10% hoặc 100,000 VNĐ)
    },
    min_discount: {
        type: Number,
        min: 0,
        default: 0, // Giá trị đơn hàng tối thiểu để áp dụng mã
    },
    max_discount: {
        type: Number,
        default: 0, // Giới hạn số tiền giảm tối đa (0 là không giới hạn)
    },
    usage_limit: {
        type: Number,
        default: 1, // Số lần mã giảm giá có thể được sử dụng
    },
    used_count: {
        type: Number,
        default: 0, // Số lần mã giảm giá đã được sử dụng
    },
    user_limit: {
        type: Number,
        default: 1, // Số lần một người dùng có thể sử dụng mã giảm giá
    },
    apply_all_users: {
        type: Boolean,
        default: false, // false: chỉ áp dụng cho danh sách apply_users, true: áp dụng cho tất cả
    },
    apply_users: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User', // Danh sách người dùng được phép sử dụng mã
        },
    ],
    cycles_id: {
        type: Schema.Types.ObjectId,
        ref: 'Cycles',
        required: true,
    },
    first_order: {
        type: Boolean,
        default: false, // Chỉ áp dụng cho đơn hàng đầu tiên?
    },
    status: {
        type: Boolean,
        default: true, // Trạng thái của mã giảm giá
    },
    recurring_type: {
        type: String,
        enum: ['buy', 'register', 'renew', 'upgrade'],
        required: true,
    },
    pay_method: {
        type: String,
        enum: ['app_wallet'],
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    expired_at: {
        type: Date,
        required: true,
    },
});

couponSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Coupon.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Coupon = mongoose.model('Coupon', couponSchema);
