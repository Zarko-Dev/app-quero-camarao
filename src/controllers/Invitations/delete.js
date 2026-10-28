import * as InvitationsRepository from "../../repositories/InvitationsRepository";

export const deleteInvitation = async (invitationId) => {
    return InvitationsRepository.deleteInvitation(invitationId);
};