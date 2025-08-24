/* eslint-disable operator-linebreak */

import { object, string } from "yup";
import Toast from "react-native-toast-message";

const fieldErrorMessages = {
    name: "Nome é obrigatório",
    phone: "Telefone é obrigatório",
    phoneValidation: "Telefone inválido",
    dateBirth: "Data de Aniversário é obrigatório",
    dateBirthValidation: "Data de Aniversário inválida",
    ponds: "Quantidade de Viveiros é obrigatório",
    acre: "Hectares é obrigatório",
};

export const productroValidationForm = (productorData) => {
    const productorSchema = object({
        name: string().required(fieldErrorMessages.name),
        phone: string()
            .required(fieldErrorMessages.phone)
            .matches(
                /^\(\d{2}\) \d{5}-\d{4}$/,
                fieldErrorMessages.phoneValidation,
            ),
        dateBirth: string()
            .required(fieldErrorMessages.dateBirth)
            .matches(
                /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
                fieldErrorMessages.dateBirthValidation,
            ),
        ponds: string().required(fieldErrorMessages.ponds),
        acre: string().required(fieldErrorMessages.acre),
    });

    try {
        productorSchema.validateSync(productorData, { abortEarly: false });

        return true;
    } catch (errors) {
        const errorMessage = errors.inner[0].message;

        Toast.show({
            type: "error",
            text1: errorMessage,
        });

        return false;
    }
};

export const clientValidationForm = (clientData) => {
    const clientSchema = object({
        name: string().required(fieldErrorMessages.name),
        phone: string()
            .required(fieldErrorMessages.phone)
            .matches(
                /^\(\d{2}\) \d{5}-\d{4}$/,
                fieldErrorMessages.phoneValidation,
            ),
        dateBirth: string()
            .required(fieldErrorMessages.dateBirth)
            .matches(
                /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
                fieldErrorMessages.dateBirthValidation,
            ),
    });

    try {
        clientSchema.validateSync(clientData, { abortEarly: false });

        return true;
    } catch (errors) {
        const errorMessage = errors.inner[0].message;

        Toast.show({
            type: "error",
            text1: errorMessage,
        });

        return false;
    }
};
