import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const bonusPointSchema = new Schema({
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
    wallet_id: {
        type: Schema.Types.ObjectId,
        ref: 'Wallet',
        required: true,
    },
    bonus_point: {
        type: Number,
        required: true,
    },
    bonus_type: {
        type: String,
        enum: ['income', 'exchange'],
        required: true,
    },
    reason: {
        type: Schema.Types.Mixed,
        default: null,
    },
    status: {
        type: String,
        enum: ['pending', 'processed', 'failed'],
        default: 'pending',
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

bonusPointSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.BonusPoint.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }
        this.id = id;
    }

    next();
});

export const BonusPoint = mongoose.model('BonusPoint', bonusPointSchema);
