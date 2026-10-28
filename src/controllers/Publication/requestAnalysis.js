import * as PublicationsRepository from "../../repositories/PublicationsRepository";

export const requestAnalysis = async (publicationId) => {
    return PublicationsRepository.requestAnalysis(publicationId);
};

export const changeRequestExtensionDate = async (
    publicationId,
    requestExtensionDate,
    createdAt,
) => {
    return PublicationsRepository.changeRequestExtensionDate(
        publicationId,
        requestExtensionDate,
        createdAt,
    );
};