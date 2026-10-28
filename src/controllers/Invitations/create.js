import * as InvitationsRepository from "../../repositories/InvitationsRepository";

export const createUserInvitation = async (userId, dataInvitations) => {
    return InvitationsRepository.createUserInvitation(userId, dataInvitations);
};