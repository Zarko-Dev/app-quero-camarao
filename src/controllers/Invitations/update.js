import * as InvitationsRepository from "../../repositories/InvitationsRepository";

export const updateInvitationMoreAccepted = async (
    invitationId,
    invitationsAccepted,
) => {
    return InvitationsRepository.updateInvitationMoreAccepted(
        invitationId,
        invitationsAccepted,
    );
};

export const updateInvitationMoreSended = async (
    invitationId,
    invitationsSended,
) => {
    return InvitationsRepository.updateInvitationMoreSended(
        invitationId,
        invitationsSended,
    );
};