import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const membershipSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        immutable: true,
    },
    name: {
        type: String,
        enum: ['potential', 'silver', 'gold', 'diamond'],
        required: true,
    },
    achieve_point: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    status: {
        type: Boolean,
        default: true,
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

membershipSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Membership.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Membership = mongoose.model('Membership', membershipSchema);
