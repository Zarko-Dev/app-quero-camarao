import * as UsersRepository from "../../repositories/UsersRepository";

export const updateUser = async (dataUser) => {
    return UsersRepository.updateUser(dataUser);
};

export const updateUserInvitationGuestStatus = async (
    userid,
    fristIndication,
) => {
    return UsersRepository.updateUserInvitationGuestStatus(
        userid,
        fristIndication,
    );
};

export const updateUserWasInvitedStatus = async (userid, wasInvited) => {
    return UsersRepository.updateUserWasInvitedStatus(userid, wasInvited);
};

export const updateClientUserLocation = async (state, city, userId) => {
    return UsersRepository.updateClientUserLocation(state, city, userId);
};