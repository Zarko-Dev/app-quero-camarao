import { ConfigDataActions } from "./actions";

const INITIAL_STATE = {
    configData: {
        androidUrl: "",
        androidUri: "",
        iosUrl: "",
        iosUri: "",
        invitationDiscount: 60,
        fristInvitationCredit: 120,
        secondInvitationCredit: 10,
        versionNumber: "0.0.0",
        pondShrimpValue: 120,
    },
};

export const ConfigDataReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ConfigDataActions.SET_CONFIG_DATA_ACTION:
            return { ...state, configData: action.configData };

        default:
            return { ...state };
    }
};
