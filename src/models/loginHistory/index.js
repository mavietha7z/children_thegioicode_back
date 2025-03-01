import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const loginHistorySchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        immutable: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ip: {
        type: String,
        default: '',
    },
    address: {
        type: String,
        default: '',
    },
    user_agent: {
        type: String,
        default: '',
    },
    device: {
        type: Object,
        default: null,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

loginHistorySchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.LoginHistory.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const LoginHistory = mongoose.model('LoginHistory', loginHistorySchema);
