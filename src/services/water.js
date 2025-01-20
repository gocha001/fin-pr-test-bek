import expressAsyncHandler from "express-async-handler";
import { Water } from "../db/models/water.js";
// import createHttpError from "http-errors";


export async function addWaterCardService(waterNote) {
  return Water.create(waterNote);
}

export const updateWaterCardService = async (cardId, card) => {
  return Water.findOneAndUpdate(
    { _id: cardId, owner: card.owner },
    card,
    {
      new: true,
    },
  );
};

export const deleteWaterCardService = async (cardId, owner) => {
  return Water.findOneAndDelete({ _id: cardId, owner });
};


export const getDayWaterService = expressAsyncHandler(async (req, res) => {
  const { _id: owner } = req.user;
  const date = new Date(req.query.date);

  const userTimezoneOffset = req.user.timezoneOffset || 0;

// Початок дня у UTC
const startOfDay = new Date(date);
startOfDay.setUTCHours(0, 0, 0, 0); // Встановлюємо час на початок дня (00:00:00)
startOfDay.setMinutes(startOfDay.getMinutes() - userTimezoneOffset); // Коригуємо на часовий пояс користувача

// Кінець дня у UTC
const endOfDay = new Date(date);
endOfDay.setUTCHours(23, 59, 59, 999); // Встановлюємо час на кінець дня (23:59:59.999)
endOfDay.setMinutes(endOfDay.getMinutes() - userTimezoneOffset); // Коригуємо на часовий пояс користувача


  const foundWaterDayData = await Water.find({
    owner,
    date: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  });

  // if (!foundWaterDayData.length) {
  //   throw createHttpError(404, `Info for this day not found`);
  // }

  if (!foundWaterDayData.length) {
    return {
      date,
      totalDayWater: 0,
      consumedWaterData : [],
      owner,
    };
  }

  const totalDayWater = foundWaterDayData.reduce(
    (acc, item) => acc + item.amount,
    0,
  );
  const consumedWaterData = foundWaterDayData.map(item => ({
    _id: item._id,
    date: item.date,
    amount: item.amount
  }));

  return {
    date,
    totalDayWater,
    consumedWaterData,
    owner,
  };
});


export const getMonthWaterService = expressAsyncHandler(async (req, res) => {
  const { _id: owner } = req.user;
  const date = new Date(req.query.date);

  // Початок місяця
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);

  // Кінець місяця
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const foundWaterMonthData = await Water.find({
    owner,
    date: {
      $gte: startOfMonth,
      $lt: endOfMonth,
    },
  });

  const aggregatedData = foundWaterMonthData.reduce((acc, item) => {
    const date = new Date(item.date);
    const day = date.getDate();

    if (!acc[day]) {
      acc[day] = {
        date: new Date(date.setHours(0, 0, 0, 0)).toISOString(),
        totalDayWater: 0,
      };
    }
    acc[day].totalDayWater += item.amount;

    return acc;
  }, {});

  const result = Object.values(aggregatedData);
  return result;
});
