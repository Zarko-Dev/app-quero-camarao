import * as PublicationsRepository from "../../repositories/PublicationsRepository";

export const setNewVisualizationPublication = async (
    publicationId,
    publicationViewsId,
    dataUserView,
    dataPublication,
) => {
    return PublicationsRepository.setNewVisualizationPublication(
        publicationId,
        publicationViewsId,
        dataUserView,
        dataPublication,
    );
};