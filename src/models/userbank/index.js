import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const userbankSchema = new Schema({
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
    localbank_id: {
        type: Schema.Types.ObjectId,
        ref: 'Localbank',
        required: true,
    },
    account_number: {
        type: String,
        required: true,
    },
    account_holder: {
        type: String,
        required: true,
    },
    account_password: {
        type: String,
        default: '',
    },
    branch: {
        type: String,
        default: '',
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

userbankSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Userbank.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Userbank = mongoose.model('Userbank', userbankSchema);
