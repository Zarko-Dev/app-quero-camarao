export const convertDate = (date, removeHours) => {
    if (date) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hour = String(date.getHours()).padStart(2, "0");
        const minut = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        if (removeHours) {
            return `${day}/${month}/${year}`;
        }

        return `${day}/${month}/${year} ${hour}:${minut}:${seconds}`;
    }

    return "";
};

export const getCurrentExtendedMonth = () => {
    const currentDate = new Date();

    currentDate.setHours(currentDate.getHours() - 3);

    const monthName = new Intl.DateTimeFormat("pt-BR", {
        month: "long",
    }).format(currentDate);

    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
};

export const getCurrentYear = () => {
    const currentDate = new Date();

    currentDate.setHours(currentDate.getHours() - 3);

    return currentDate.getFullYear();
};

export const refactDate = (date) => {
    const newDate = new Date(date);

    return newDate.setHours(newDate.getHours() - 3);
};
