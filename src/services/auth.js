import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';
import {
  accessTokenLifeTime,
  refreshTokenLifeTime,
  TEMPLATES_DIR
} from '../constants/constants.js';

import jwt from 'jsonwebtoken';
import { env } from "../utils/env.js";
import { sendEmail } from '../utils/sendMail.js';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import {
  getFullNameFromGoogleTokenPayload,
  validateCode,
} from "../utils/googleOAuth2.js";


const createSession = (userId) => {
  const accessToken = crypto.randomBytes(30).toString('base64');
  const refreshToken = crypto.randomBytes(30).toString('base64');
  const accessTokenValidUntil = new Date(Date.now() + accessTokenLifeTime);
  const refreshTokenValidUntil = new Date(Date.now() + refreshTokenLifeTime);

  return {
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  };
};

//--------------------registerUserService--------------------
export async function registerUserService(payload) {
  const { email, password } = payload;
  const existingUser = await User.findOne({ email });
  if (existingUser) throw createHttpError(409, 'Email already exist');

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    ...payload,
    password: hashedPassword
  });

  return {
    _id: newUser._id,
    email: newUser.email,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };
}

//--------------------loginUserService--------------------
export async function loginUserService(payload) {
  const { email, password } = payload;
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(
      404,
      'User not found! Please, check the email address and try again.',
    );
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw createHttpError(401, 'Email or password is incorrect');
  }

  await Session.deleteOne({ userId: user._id });
  const newSession = createSession(user._id);
  const createdSession = await Session.create(newSession);

  const userWithTokens = {
    ...user.toObject(),
    accessToken: createdSession.accessToken,
    refreshToken: createdSession.refreshToken
  };

  return {
    session: createdSession,
    user: userWithTokens
  };
}

//--------------------refreshUsersSessionService--------------------
export const refreshUsersSessionService = async ({ sessionId, refreshToken }) => {
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found!');
  }

  const isSessionTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);
  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  await Session.deleteOne({ _id: sessionId });
  const user = await User.findOne({ _id: session.userId });

  if (!user) {
    throw createHttpError(404, 'User not found!');
  }
  const newSession = createSession(user._id);
  const createdSession = await Session.create(newSession);

  return {
    session: createdSession,
    user,
  };
};

//--------------------logoutUserService--------------------
export const logoutUserService = async (sessionId) => {
  await Session.deleteOne({ _id: sessionId });
};

//--------------------updateUserService--------------------
export const updateUserService = async (userId, updates) => {
  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
    upsert: false,
  });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }
  return user;
};

//--------------------loginOrSignupWithGoogle--------------------
export const loginOrSignupWithGoogle = async (code) => {
  const loginTicket = await validateCode(code);
  const payload = loginTicket.getPayload();

  if (!payload) throw createHttpError(401);

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    const password = await bcrypt.hash(crypto.randomBytes(10).toString('base64'), 10);
    user = await User.create({
      email: payload.email,
      name: getFullNameFromGoogleTokenPayload(payload),
      password,
    });
  }

  const newSession = createSession();
  const session = await Session.create({
    userId: user._id,
    ...newSession,
  });

  return { session, user };
};

//--------------------resetMailService--------------------
export const requestResetTokenService = async (email) => {

    const user = await User.findOne({ email });
    if (!user) {
        throw createHttpError(404, "User not found");
    }

    const resetToken = jwt.sign(
        {
            sub: user._id,
            email
        },
        env('JWT_SECRET'),
        {
            expiresIn: '5m'
        }
    );

    const resetPasswordTemplatePath = path.join(
        TEMPLATES_DIR,
        'reset-password-email.html'
    );

    let templateSource;
    try {
        templateSource = (await fs.readFile(resetPasswordTemplatePath)).toString();
    } catch (err) {
        console.error('Template file error:', err);
        throw new Error('Template file not found or cannot be read');
    }

    const template = handlebars.compile(templateSource);
    const resetLink = `${env('APP_DOMAIN')}/auth/reset-password?token=${resetToken}`;
    const html = template({
        name: user.name || user.email.split('@')[0],
        link: resetLink
    });
    console.log('Generated reset link:', resetLink);

    await sendEmail({
        from: env('SMTP_FROM'),
        to: email,
        subject: 'Reset your password',
        html
    });
};

export const validateResetTokenService = async ({ token }) => {
    if (!token) {
        throw createHttpError(400, "Token is required");
    }
    try {
        const decodedToken = jwt.verify(token, env('JWT_SECRET'));
        return decodedToken;
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            throw createHttpError(401, "Token is expired or invalid.");
        } else {
            throw createHttpError(500, "Internal server error.");
        }
    }
};

//--------------------resetPasswordService--------------------
export const resetPasswordService = async (payload) => {
    let entries;

    try {
        entries = jwt.verify(payload.token, env('JWT_SECRET'));
    } catch (err) {
        if (err instanceof Error) throw createHttpError(401, err.message);
        throw err;
    }

    const user = await User.findOne({
        email: entries.email,
        _id: entries.sub
    });

    if (!user) {
        throw createHttpError(404, "User not found");
    }

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    await User.updateOne(
        { _id: user._id },
        {password: encryptedPassword}
    );
};

//--------------------getUserCountService--------------------
export const getUserCounterService = async () => {
  return await User.countDocuments();
};
