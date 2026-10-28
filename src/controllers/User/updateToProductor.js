import * as UsersRepository from "../../repositories/UsersRepository";

export const UpdateUserToProductor = async (userId, dataUpdate) => {
    return UsersRepository.UpdateUserToProductor(userId, dataUpdate);
};