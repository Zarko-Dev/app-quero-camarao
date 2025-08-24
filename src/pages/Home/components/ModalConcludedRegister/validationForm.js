/* eslint-disable operator-linebreak */

import { object, string } from "yup";

const fieldErrorMessages = {
    cpf: "CPF é obrigatório",
    cpfValidation: "CPF inválido",
    ponds: "Quantidade de Viveiros é obrigatório",
    acre: "Hectares é obrigatório",
};

export const productroValidationForm = (productorData) => {
    const productorSchema = object({
        cpf: string()
            .required(fieldErrorMessages.cpf)
            .matches(
                /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                fieldErrorMessages.cpfValidation,
            )
            .test(
                "cpf-validation",
                fieldErrorMessages.cpfValidation,
                (value) => {
                    const cleanedCpf = value.replace(/\D/g, "");

                    if (/^(\d)\1{10}$/.test(cleanedCpf)) {
                        return false;
                    }

                    let sum = 0;
                    let remainder;
                    for (let i = 1; i <= 9; i++) {
                        sum +=
                            parseInt(cleanedCpf.substring(i - 1, i), 10) *
                            (11 - i);
                    }
                    remainder = (sum * 10) % 11;
                    if (remainder === 10 || remainder === 11) {
                        remainder = 0;
                    }
                    if (
                        remainder !== parseInt(cleanedCpf.substring(9, 10), 10)
                    ) {
                        return false;
                    }

                    sum = 0;
                    for (let i = 1; i <= 10; i++) {
                        sum +=
                            parseInt(cleanedCpf.substring(i - 1, i), 10) *
                            (12 - i);
                    }
                    remainder = (sum * 10) % 11;
                    if (remainder === 10 || remainder === 11) {
                        remainder = 0;
                    }
                    if (
                        remainder !== parseInt(cleanedCpf.substring(10, 11), 10)
                    ) {
                        return false;
                    }

                    return true;
                },
            ),
        ponds: string().required(fieldErrorMessages.ponds),
        acre: string().required(fieldErrorMessages.acre),
    });

    try {
        productorSchema.validateSync(productorData, { abortEarly: false });

        return {
            error: false,
            message: "",
        };
    } catch (errors) {
        const errorMessage = errors.inner[0].message;

        return {
            error: true,
            message: errorMessage,
        };
    }
};
