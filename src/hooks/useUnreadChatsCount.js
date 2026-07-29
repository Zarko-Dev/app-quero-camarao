import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { subscribeUnreadChatsCount } from "../controllers/Chat";

export const useUnreadChatsCount = () => {
    const { dataUser } = useSelector((state) => state.login);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const userId = dataUser?.email ?? dataUser?.uid;
        if (!userId) {
            setCount(0);
            return undefined;
        }
        const unsub = subscribeUnreadChatsCount(userId, setCount);
        return unsub;
    }, [dataUser?.email, dataUser?.uid]);

    return count;
};
