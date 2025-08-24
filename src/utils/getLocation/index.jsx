import Toast from "react-native-toast-message";
import { cities } from "./cities";

import { federalUnit } from "./federalUnit";

// export const getState = async () => {
//     const dataState = await (
//         await fetch(
//             "https://servicodados.ibge.gov.br/api/v1/localidades/estados",
//         )
//     ).json();

//     return dataState.map((state) => state.sigla) || [];
// };

export const getState = async () => federalUnit.map((state) => state.uf) || [];

// export const getCity = async (uf) => {
//     const dataCity = await (
//         await fetch(
//             `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
//         )
//     ).json();

//     return dataCity.map((state) => state.nome) || [];
// };

export const getCity = async (uf) =>
    cities.filter((city) => city.uf === uf).map((item) => item.name) || [];

export const getLocationByCep = async (cep) => {
    try {
        const dataLocation = await (
            await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        ).json();

        return {
            state: dataLocation.uf,
            city: dataLocation.localidade,
            neighborhood: dataLocation.bairro,
            street: dataLocation.logradouro,
        };
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Não foi possível buscar o CEP",
            text2: "Tente novamente",
        });

        return null;
    }
};
