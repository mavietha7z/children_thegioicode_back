import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const walletHistorySchema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
        immutable: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['service', 'deposit', 'withdraw', 'recharge', 'withdrawal'],
        required: true,
    },
    service: {
        type: String,
        required: true,
    },
    before: {
        type: Number,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    after: {
        type: Number,
        required: true,
    },
    bonus_point: {
        type: Number,
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
});

walletHistorySchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.WalletHistory.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }
        this.id = id;
    }

    next();
});

export const WalletHistory = mongoose.model('WalletHistory', walletHistorySchema);
