import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    avatarURL: {
      type: String,
      default: "https://res.cloudinary.com/dhufqulj5/image/upload/v1736796700/pvtpcewd72z3ixrwjo7n.png",
    },
    name: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      default: 'female',
    },
    weight: {
      type: Number,
      default: 0,
    },
    activityTime: {
      type: Number,
      default: 0,
    },
    desiredVolume: {
      type: Number,
      min: 0.05,
      max: 5,
      default: 1.5,
    },
    accessToken: {
      type: String,
      default: '',
    },
    refreshToken: {
      type: String,
      default: '',
    },
    verification: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    resetPasswordToken: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.accessToken;
  delete obj.refreshToken;
  delete obj.verification;
  return obj;
};

export const User = model('User', userSchema);
