import { useRoute } from "@react-navigation/native";
import { UserDivideList } from "../../../components/UserDivideList";
import { dataRoutes } from "../../../routes/dataRoutes";
import { ScrollContentUserList } from "./styles";

export const UserProductorClientList = ({ navigation }) => {
    const route = useRoute();
    const { dataUsers } = route.params;

    const handleRedirectListUsers = (users) => {
        navigation.navigate(dataRoutes.admin.usersList, {
            dataListUsers: users,
        });
    };

    return (
        <ScrollContentUserList>
            {dataUsers.map((dataUser, index) => (
                <UserDivideList
                    key={`${dataUser.state}-${index}`}
                    listUsers={dataUser}
                    redirectAction={handleRedirectListUsers}
                />
            ))}
        </ScrollContentUserList>
    );
};
