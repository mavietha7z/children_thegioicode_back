import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const resourceProductSchema = new Schema({
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
    category_id: {
        type: Schema.Types.ObjectId,
        ref: 'ResourceCategory',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    priority: {
        type: Number,
        required: true,
    },
    image_url: {
        type: String,
        default: '',
    },
    view_count: {
        type: Number,
        default: 0,
    },
    purchase_count: {
        type: Number,
        default: 0,
    },
    status: {
        type: Boolean,
        default: false,
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

resourceProductSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.ResourceProduct.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const ResourceProduct = mongoose.model('ResourceProduct', resourceProductSchema);
