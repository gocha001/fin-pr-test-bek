import { Router } from 'express';
import {
  registerUserController,
  loginUserController,
  loginWithGoogleController,
  refreshSessionController,
  logoutUserController,
  updateUserController,
  getGoogleOAuthUrlController,
  requestResetEmailController,
  resetPasswordController,
  validateResetTokenController,
  getCurrentUserController,
  getUserCountController
} from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
  loginWithGoogleOAuthSchema,
  requestResetEmailSchema,
  resetPasswordSchema
} from '../validation/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from "../middlewares/authenticate.js";
import { upload } from "../middlewares/upload.js";

const router = Router();

router.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerUserController),
);
router.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUserController),
);
router.post('/refresh', ctrlWrapper(refreshSessionController));
router.post('/logout', ctrlWrapper(logoutUserController));

router.patch(
  "/update-user",
  upload.single("avatar"),
  authenticate,
  validateBody(updateUserSchema),
  ctrlWrapper(updateUserController),
);

router.get("/get-oauth-url", ctrlWrapper(getGoogleOAuthUrlController));

router.post(
  "/google-login",
  validateBody(loginWithGoogleOAuthSchema),
  ctrlWrapper(loginWithGoogleController),
);

router.post(
  '/send-reset-email',
  validateBody(requestResetEmailSchema),
  ctrlWrapper(requestResetEmailController),
);

router.get(
    '/reset-password',
    ctrlWrapper(validateResetTokenController)
);

router.post(
    '/reset-pwd',
    validateBody(resetPasswordSchema),
    ctrlWrapper(resetPasswordController)
);

router.get('/current', authenticate, ctrlWrapper(getCurrentUserController));

router.get("/count", ctrlWrapper(getUserCountController));

export default router;
