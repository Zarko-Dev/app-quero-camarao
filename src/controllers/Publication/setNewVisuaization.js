import * as PublicationsRepository from "../../repositories/PublicationsRepository";

export const setNewVisualizationPublication = async (
    publicationId,
    publicationViewsId,
    views,
    dataViews,
    dataUserView,
    dataPublication,
) => {
    return PublicationsRepository.setNewVisualizationPublication(
        publicationId,
        publicationViewsId,
        views,
        dataViews,
        dataUserView,
        dataPublication,
    );
};