/* eslint-disable operator-linebreak */

import { object, string } from "yup";
import Toast from "react-native-toast-message";

const fieldErrorMessages = {
    cep: "CEP é obrigatório",
    state: "Estado deve ser selecionado",
    city: "Cidade deve ser selecionada",
    neighborhood: "Bairro é obrigatório",
    street: "Rua é obrigatória",
    number: "Numero é obrigatório",
};

export const addressValidationForm = (addressData) => {
    const addressSchema = object({
        cep: string().required(fieldErrorMessages.cep),
        state: string().required(fieldErrorMessages.state),
        city: string().required(fieldErrorMessages.city),
        neighborhood: string().required(fieldErrorMessages.neighborhood),
        street: string().required(fieldErrorMessages.street),
        number: string().required(fieldErrorMessages.number),
    });

    try {
        addressSchema.validateSync(addressData, { abortEarly: false });

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
