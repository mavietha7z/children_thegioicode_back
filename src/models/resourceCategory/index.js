import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const resourceCategorySchema = new Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
        immutable: true,
    },
    title: {
        type: String,
        required: true,
    },
    slug_url: {
        type: String,
        unique: true,
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

resourceCategorySchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.ResourceCategory.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const ResourceCategory = mongoose.model('ResourceCategory', resourceCategorySchema);
