import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const tokenSchema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
        immutable: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    modun: {
        type: String,
        required: true,
    },
    service: {
        type: String,
        enum: ['email', 'google'],
        default: null,
    },
    encrypt: {
        type: String,
        enum: ['jsonwebtoken', 'bcrypt', 'crypto', 'random'],
        required: true,
    },
    token: {
        type: String,
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

tokenSchema.index({ expired_at: 1 }, { expireAfterSeconds: 0 });

tokenSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Token.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Token = mongoose.model('Token', tokenSchema);
