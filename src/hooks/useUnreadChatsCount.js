import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { subscribeUnreadChatsCount } from "../controllers/Chat";
import { GetUserStorage } from "../services/Storage/UserStorage";

// O redux de login não guarda dataUser: o id vem do storage, como em MyChats.
export const useUnreadChatsCount = () => {
    const isAuthenticated = useSelector((state) => state.login.isAuthenticated);
    const [userId, setUserId] = useState(null);
    const [count, setCount] = useState(0);

    useEffect(() => {
        let active = true;
        GetUserStorage()
            .then((user) => { if (active) setUserId(user?.email ?? user?.uid ?? null); })
            .catch(() => { if (active) setUserId(null); });
        return () => { active = false; };
    }, [isAuthenticated]);

    useEffect(() => {
        if (!userId) {
            setCount(0);
            return undefined;
        }
        return subscribeUnreadChatsCount(userId, setCount);
    }, [userId]);

    return count;
};
