import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const newsFeedSchema = new Schema({
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
    title: {
        type: String,
        required: true,
    },
    pin_top: {
        type: Boolean,
        default: false,
    },
    content_text: {
        type: String,
        required: true,
    },
    content_html: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: false,
    },
    likes: [
        {
            _id: false,
            user_id: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            created_at: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    like_count: {
        type: Number,
        default: 0,
    },
    comment_count: {
        type: Number,
        default: 0,
    },
    share_count: {
        type: Number,
        default: 0,
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

newsFeedSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.NewsFeed.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }
        this.id = id;
    }

    next();
});

export const NewsFeed = mongoose.model('NewsFeed', newsFeedSchema);
