import { Joi, SchemaOptions, Segments, Modes, celebrate } from "celebrate";

export const validate = (schema: SchemaOptions) =>
    celebrate(schema, { abortEarly: false }, { mode: Modes.FULL });


const phoneNumber = Joi.string().required();
const password = Joi.string().min(6).required();

export const loginSchema = {
    [Segments.BODY]: {
        phoneNumber, password
    }
};

export const registerSchema = {
    [Segments.BODY]: {
        phoneNumber,
        password,
        name: Joi.string().required(),
        note: Joi.string(),
        address: Joi.string(),
    }
}






