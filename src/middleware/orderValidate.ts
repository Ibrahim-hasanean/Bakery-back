import { Joi, SchemaOptions, Segments, Modes, celebrate } from "celebrate";

export const validate = (schema: SchemaOptions) =>
    celebrate(schema, { abortEarly: false }, { mode: Modes.FULL });


const userId = Joi.string().required();
const breedAmount = Joi.number().required();
const flourAmount = Joi.number().required();
const payedAmount = Joi.number().required();
const debt = Joi.number().required();
const note = Joi.string();
const date = Joi.date();

export const addFlourSchema = {
    [Segments.BODY]: {
        date, userId, flourAmount, note, payedAmount
    }
};

export const addBreedSchema = {
    [Segments.BODY]: {
        date, userId, breedAmount, note, payedAmount
    }
};

export const addDebtSchema = {
    [Segments.BODY]: {
        date, userId, debt, note
    }
};

export const addPayedSchema = {
    [Segments.BODY]: {
        date, userId, note, amount: Joi.number().required()
    }
};







