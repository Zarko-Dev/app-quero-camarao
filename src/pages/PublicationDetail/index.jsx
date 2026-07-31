import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { getLatestShrimpPonds } from "../../controllers/ShrimpPonds/getAll";
import { CardPublicationShrimp } from "../../components/CardPublicationShrimp";
import { ShrimpCardShared } from "../../components/ShrimpCardShared/inedx";
import {
    CenterState,
    Container,
    ErrorText,
    HeaderTitle,
    OthersLabel,
    ScreenHeader,
    SoldBanner,
    SoldBannerText,
} from "./styles";

export const PublicationDetail = ({ route, navigation }) => {
    const { publicationId } = route.params ?? {};

    const [publication, setPublication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [otherPublications, setOtherPublications] = useState([]);

    const sharedRef = useRef(null);

    useEffect(() => {
        if (!publicationId) {
            setLoading(false);
            setNotFound(true);
            return;
        }
        getDoc(doc(firestore, models.shrimpPonds, publicationId))
            .then((snap) => {
                if (snap.exists()) {
                    setPublication({ id: snap.id, ...snap.data() });
                } else {
                    setNotFound(true);
                }
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [publicationId]);

    useEffect(() => {
        if (!publication?.sold) return;
        getLatestShrimpPonds()
            .then((items) => {
                const available = items.filter(
                    (item) => item.id !== publication.id && !item.sold,
                ).slice(0, 5);
                setOtherPublications(available);
            })
            .catch(() => {});
    }, [publication?.sold, publication?.id]);

    const openModal = () => {
        Toast.show({
            type: "info",
            text1: "Entre na sua conta para continuar",
        });
    };

    const renderContent = () => {
        if (loading) {
            return (
                <CenterState>
                    <ActivityIndicator color="#f55b1f" />
                </CenterState>
            );
        }
        if (notFound || !publication) {
            return (
                <CenterState>
                    <ErrorText>Anúncio não encontrado</ErrorText>
                </CenterState>
            );
        }
        return (
            <FlatList
                data={otherPublications}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <CardPublicationShrimp
                        item={item}
                        index={index}
                        dataAdvertising={[]}
                        sharedRef={sharedRef}
                        openModal={openModal}
                    />
                )}
                ListHeaderComponent={(
                    <>
                        {publication.sold && (
                            <SoldBanner>
                                <SoldBannerText>
                                    Este camarão foi vendido.
                                </SoldBannerText>
                            </SoldBanner>
                        )}
                        <CardPublicationShrimp
                            item={publication}
                            index={0}
                            dataAdvertising={[]}
                            sharedRef={sharedRef}
                            openModal={openModal}
                        />
                        {publication.sold && otherPublications.length > 0 && (
                            <OthersLabel>Outros camarões disponíveis</OthersLabel>
                        )}
                    </>
                )}
                contentContainerStyle={{ padding: 12 }}
            />
        );
    };

    return (
        <Container>
            <ScreenHeader>
                <Feather name="arrow-left" size={22} color="#36536e" onPress={() => navigation.goBack()} />
                <HeaderTitle>Anúncio</HeaderTitle>
            </ScreenHeader>
            {renderContent()}
            <ShrimpCardShared shrimpCardRef={sharedRef} />
        </Container>
    );
};
