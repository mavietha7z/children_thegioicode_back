import mongoose, { Schema } from 'mongoose';

const requestSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    service_id: {
        type: Schema.Types.ObjectId,
        ref: 'Api',
    },
    method: {
        type: String,
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
    headers: {
        type: Object,
        required: true,
    },
    params: {
        type: Object,
        required: true,
    },
    query: {
        type: Object,
        required: true,
    },
    body: {
        type: Object,
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },
    response: {
        type: Object,
        required: true,
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

export const Request = mongoose.model('Request', requestSchema);
