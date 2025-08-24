import { combineReducers } from "redux";

import { LoginReducer } from "../pages/Login/reducer";
import { PublicationReducer } from "../pages/Publication/reducer";
import { ShrimpCardSharedReducer } from "../components/ShrimpCardShared/reducer";
import { PaymentReducer } from "../pages/Payment/reducer";
import { InvitationReducer } from "../pages/ValidateInvitation/reducer";
import { PaymentWalletReducer } from "../pages/Payment/components/ResumeCrad/reducer";
import { ConfigDataReducer } from "../components/AlertNewVersion/reducer";
import { NotificationExecuteReducer } from "../components/Header/reducer";

export const rootReducer = combineReducers({
    login: LoginReducer,
    publication: PublicationReducer,
    shrimpCardShared: ShrimpCardSharedReducer,
    payment: PaymentReducer,
    invitation: InvitationReducer,
    paymentWallet: PaymentWalletReducer,
    configSystem: ConfigDataReducer,
    notificationExecute: NotificationExecuteReducer,
});
