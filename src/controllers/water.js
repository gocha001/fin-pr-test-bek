import createHttpError from "http-errors";
import { addWaterCardService, deleteWaterCardService, getDayWaterService, getMonthWaterService, updateWaterCardService } from "../services/water.js";

export async function addWaterCardController(req, res) {
  const {date, amount} = req.body;
  const userId = req.user.id;
  const formatedDate = new Date(date);

  const waterNote = {
    date: formatedDate,
    amount,
    owner: userId
  };

  const result = await addWaterCardService(waterNote);

  res.status(201).send({
    status: 201,
    message: 'Successfully created a water card!',
    data: result,
  });
}

export async function updateWaterCardController(req, res) {
  const {cardId} = req.params;
  const {date, amount} = req.body;
  const userId = req.user.id;
  const formatedDate = new Date(date);


  const waterNote = {
    date: formatedDate,
    amount,
    owner: userId
  };

  const result = await updateWaterCardService(cardId, waterNote);

  if (!result) {
    throw createHttpError(404, 'Card not found');
  }
  res.status(200).send({
    status: 200,
    message: 'Successfully patched a water card!',
    data: result,
  });
}

export async function deleteWaterCardController(req, res) {
  const { cardId } = req.params;
  const owner = req.user.id;

  const result = await deleteWaterCardService(cardId, owner);
  if (!result) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(204).send({status: 204});
}

export async function getDayWaterContoller(req, res) {

  const result = await getDayWaterService(req, res);
  res.status(200).send({
    status: 200,
    message: 'Daily water cards',
    data: result,
  });
}


export async function getMonthWaterContoller(req, res) {

  const result = await getMonthWaterService(req, res);
  res.status(200).send({
    status: 200,
    message: 'Total month water cards',
    data: result,
  });
}
