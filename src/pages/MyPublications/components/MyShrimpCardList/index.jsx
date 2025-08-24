import { FlatList } from "react-native";

import { CardPublicationShrimpSkeleton } from "../../../../components/Skeleton/CardPublicationShrimpSkeleton";
import { CardMyPublicationsShrimp } from "../CardMyPublicationsShrimp";

import { Container } from "./styles";

export const MyShrimpCardList = ({
    isLoading = true,
    dataPublication,
    actionDataPublication,
}) => (
    <Container>
        <FlatList
            data={
                !isLoading
                    ? dataPublication
                    : [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]
            }
            renderItem={(props) =>
                !isLoading ? (
                    <CardMyPublicationsShrimp
                        {...props}
                        action={actionDataPublication}
                    />
                ) : (
                    <CardPublicationShrimpSkeleton />
                )
            }
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
        />
    </Container>
);
