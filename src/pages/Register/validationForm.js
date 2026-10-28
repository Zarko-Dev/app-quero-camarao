/* eslint-disable operator-linebreak */

import { boolean, number, object, string } from "yup";
import Toast from "react-native-toast-message";

const fieldErrorMessages = {
    name: "Nome é obrigatório",
    email: "E-mail é obrigatório",
    emailValid: "E-mail deverá ser válido",
    phone: "Telefone é obrigatório",
    phoneValidation: "Telefone inválido",
    dateBirth: "Data de Aniversário é obrigatório",
    dateBirthValidation: "Data de Aniversário inválida",
    cpf: "CPF é obrigatório",
    zipCode: "Cep é obrigatório",
    neighborhood: "Bairro é obrigatório",
    street: "A rua é obrigatória",
    cpfValidation: "CPF inválido",
    password: "Senha é obrigatório",
    minPassword: "Senha deverá conter no mínimo 6 caracteres",
    ponds: "Quantidade de Viveiros é obrigatório",
    acre: "Hectares é obrigatório",
    state: "Estado é obrigatório",
    city: "Cidade é obrigatória",
    checked: "Termos de Uso é obrigatório",
};

export const productroValidationForm = (productorData) => {
    const productorSchema = object({
        name: string().required(fieldErrorMessages.name),
        email: string()
            .trim()
            .email(fieldErrorMessages.emailValid)
            .required(fieldErrorMessages.email),
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
        state: string().required(fieldErrorMessages.state),
        city: string().required(fieldErrorMessages.city),
        zipCode: string().required("CEP é obrigatório").matches(/^\d{5}-?\d{3}$/, "CEP inválido"), // 12345-678 ou 12345678
        neighborhood: string().trim().required(fieldErrorMessages.neighborhood),
        street: string().trim().required("Rua é obrigatório"),
        number: string().trim().required("Número é obrigatório"),
        password: string()
            .min(6, fieldErrorMessages.minPassword)
            .required(fieldErrorMessages.password),
        checked: boolean().test(
            "is-true",
            fieldErrorMessages.checked,
            (value) => value === true,
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
        email: string()
            .trim()
            .email(fieldErrorMessages.emailValid)
            .required(fieldErrorMessages.email),
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
        state: string().required(fieldErrorMessages.state),
        city: string().required(fieldErrorMessages.city),
        zipCode: string().required("CEP é obrigatório").matches(/^\d{5}-?\d{3}$/, "CEP inválido"), // 12345-678 ou 12345678
        neighborhood: string().trim().required(fieldErrorMessages.neighborhood),
        street: string().trim().required("Rua é obrigatório"),
        number: string().trim().required("Número é obrigatório"),
        password: string()
            .min(6, fieldErrorMessages.minPassword)
            .required(fieldErrorMessages.password),
        checked: boolean().test(
            "is-true",
            fieldErrorMessages.checked,
            (value) => value === true,
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
