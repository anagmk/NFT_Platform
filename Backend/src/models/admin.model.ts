import mongoose from "mongoose";

export interface AdminDocument extends mongoose.Document {
    email: string;
    name: string;
    role: string;
    isEmailVerified: boolean;
}

const adminSchema = new mongoose.Schema<AdminDocument>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "admin"
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

export default mongoose.model<AdminDocument>("Admin", adminSchema);