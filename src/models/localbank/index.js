import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const localbankSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        immutable: true,
    },
    full_name: {
        type: String,
        required: true,
    },
    sub_name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['e-wallet', 'bank'],
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    interbank_code: {
        type: String,
        unique: true,
        required: true,
    },
    logo_url: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
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

localbankSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Localbank.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Localbank = mongoose.model('Localbank', localbankSchema);
