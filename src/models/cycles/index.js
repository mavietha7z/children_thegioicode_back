import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const cyclesSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        immutable: true,
    },
    value: {
        type: Number,
        min: 1,
        default: null,
    },
    unit: {
        type: String,
        enum: ['months', 'years', 'forever'],
        required: true,
    },
    display_name: {
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

cyclesSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Cycles.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Cycles = mongoose.model('Cycles', cyclesSchema);
