/* eslint-disable no-case-declarations */

export const validateCupom = (dataCupom) => {
    const { durationType, durationValue } = dataCupom;

    switch (durationType) {
        case "Quantity":
            if (Number(durationValue) === 0) {
                return false;
            }

            return true;

        case "Time":
            const currentDate = new Date();
            currentDate.setHours(currentDate.getHours() - 3);
            const expirationDate = new Date(durationValue);

            if (currentDate > expirationDate) {
                return false;
            }

            return true;

        case "Unlimited":
            return true;

        default:
            return false;
    }
};
