import * as PublicationsRepository from "../../repositories/PublicationsRepository";

export const updateShrimpsPublication = async (
    publicationId,
    shrimps,
    edited,
    publisherId,
) => {
    return PublicationsRepository.updateShrimpsPublication(
        publicationId,
        shrimps,
        edited,
        publisherId,
    );
};

export const updatePondsPublication = async (
    publicationId,
    newShrimps,
    publisherId,
) => {
    return PublicationsRepository.updatePondsPublication(
        publicationId,
        newShrimps,
        publisherId,
    );
};

export const updatePublicationWithShirimpSalle = async (
    publicationId,
    shirimpUpdated,
) => {
    return PublicationsRepository.updatePublicationWithShirimpSalle(
        publicationId,
        shirimpUpdated,
    );
};