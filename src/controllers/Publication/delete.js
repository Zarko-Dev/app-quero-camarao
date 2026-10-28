import * as PublicationsRepository from "../../repositories/PublicationsRepository";
import { storage } from "../../services/StorageRN";

export const deletePublication = async (publicationId) => {
    return PublicationsRepository.deletePublication(publicationId);
};

export const deletePublicationImages = async (image) => {
    const { storageModels } = await import("../../services/Firebase/models");

    const deleteRef = storage().ref(`${storageModels.shrimp}/${image}`);

    try {
        await deleteRef.delete();

        return true;
    } catch (error) {
        return false;
    }
};