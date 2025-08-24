import { ShrimpCardSharedActions } from "./actions";

const INITIAL_STATE = {
    dataShrimp: {
        location: "",
        ponds: "",
        shrimps: [
            {
                grammage: "",
                kilo: "",
                imageShrimpUri:
                    "https://cbissn.ibict.br/images/phocagallery/galeria2/thumbs/phoca_thumb_l_image03_grd.png",
            },
        ],
    },
};

export const ShrimpCardSharedReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ShrimpCardSharedActions.GET_DATA_SHRIP_CARD_ACTION:
            return { ...state, dataShrimp: action.dataShrimp };

        default:
            return { ...state };
    }
};
