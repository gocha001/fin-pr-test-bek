import { isValidObjectId } from "mongoose";
import createHttpError from "http-errors";

export const isValidId = (req, res, next) => {
        const { cardId } = req.params;
        if (!isValidObjectId(cardId)) {
        throw createHttpError(400, 'Bad Request');
        }

        next();
    };

