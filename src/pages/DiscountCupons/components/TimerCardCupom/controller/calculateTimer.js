export const claculateTimer = (dateValue) => {
    const dateExpiration = new Date(dateValue);
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 3);

    const diferenca = dateExpiration - currentDate;
    if (diferenca <= 0) {
        return "Data Expirada";
    }

    const segundos = Math.floor(diferenca / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    const tempoRestante = {
        D: dias,
        H: horas % 24,
        M: minutos % 60,
        S: segundos % 60,
    };

    return `${tempoRestante.D.toString().padStart(
        2,
        "0",
    )}D ${tempoRestante.H.toString().padStart(
        2,
        "0",
    )}H ${tempoRestante.M.toString().padStart(
        2,
        "0",
    )}M ${tempoRestante.S.toString().padStart(2, "0")}S`;
};

export const claculatePublicationTimer = (
    dateValue,
    extensionDate,
    expirationText,
) => {
    const dateExpiration = new Date(dateValue);
    dateExpiration.setDate(
        dateExpiration.getDate() + (extensionDate === "approved" ? 22 : 15),
    );
    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() - 3);

    const diferenca = dateExpiration - currentDate;
    if (diferenca <= 0) {
        return expirationText;
    }

    const segundos = Math.floor(diferenca / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    const tempoRestante = {
        D: dias,
        H: horas % 24,
        M: minutos % 60,
        S: segundos % 60,
    };

    return `${tempoRestante.D.toString().padStart(
        2,
        "0",
    )}D ${tempoRestante.H.toString().padStart(
        2,
        "0",
    )}H ${tempoRestante.M.toString().padStart(
        2,
        "0",
    )}M ${tempoRestante.S.toString().padStart(2, "0")}S`;
};
