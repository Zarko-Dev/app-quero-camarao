import * as UsersRepository from "../../repositories/UsersRepository";

export const UpdateUserAddress = async (userId, dataUpdate) => {
    return UsersRepository.UpdateUserAddress(userId, dataUpdate);
};