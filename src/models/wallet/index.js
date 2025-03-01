import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const walletSchema = new Schema({
    id: {
        type: Number,
        required: true,
        immutable: true,
        unique: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    currency: {
        type: String,
        enum: ['USD', 'VND'],
        default: 'VND',
    },
    bonus_point: {
        // Điểm khuyễn mãi có thể đổi sang bonus_balance
        type: Number,
        default: 0,
    },
    credit_balance: {
        // Tài khoản chính
        type: Number,
        default: 0,
    },
    bonus_balance: {
        // Tải khoản khuyễn mãi
        type: Number,
        default: 0,
    },
    total_balance: {
        // Tổng tài khoản credit_balance + bonus_balance
        type: Number,
        default: 0,
    },
    total_bonus_point: {
        // Tổng điểm khuyễn mãi đã nhận
        type: Number,
        default: 0,
    },
    main_balance: {
        // Tài khoản có thể rút
        type: Number,
        default: 0,
    },
    total_recharge: {
        // Tổng tiền đã nạp
        type: Number,
        default: 0,
    },
    total_withdrawal: {
        // Tổng tiền đã rút
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['activated', 'inactivated', 'deleted'],
        default: 'activated',
    },
    notification_sent: {
        type: Boolean,
        default: false,
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
        default: null,
    },
    bonus_point_expiry: {
        type: Date,
        default: null,
    },
});

walletSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Wallet.findOne({ id: id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Wallet = mongoose.model('Wallet', walletSchema);
