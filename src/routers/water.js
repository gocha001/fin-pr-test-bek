import {Router} from "express";
import { validateBody } from "../middlewares/validateBody.js";
import { addWaterCardController, deleteWaterCardController, getDayWaterContoller, getMonthWaterContoller, updateWaterCardController } from "../controllers/water.js";
import { addWaterCardSchema, updateWaterCardSchema } from "../validation/water.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { isValidId } from "../middlewares/isValidId.js";


const router = Router();

router.post(
  '/',
  validateBody(addWaterCardSchema),
  ctrlWrapper(addWaterCardController)
);
router.patch(
  '/:cardId',
  isValidId,
  validateBody(updateWaterCardSchema),
  ctrlWrapper(updateWaterCardController)
);

router.delete('/:cardId', isValidId, ctrlWrapper(deleteWaterCardController));

router.get(
  '/day',
  ctrlWrapper(getDayWaterContoller),
);
router.get(
  '/month',
  ctrlWrapper(getMonthWaterContoller),
);

export default router;
