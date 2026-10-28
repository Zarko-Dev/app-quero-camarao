import { useState, useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { AddressCard } from "./components/AddressCard";
import { PaymentButton } from "./components/PaymentButton";
import { ResumeCrad } from "./components/ResumeCrad";
import { ShrimpCard } from "./components/ShrimpCard";

import { 
    Container, 
    Content, 
    ContentResume,
    MainContainer,
    ScreenHeader,
    BackButtonPill,
    BackButtonText,
    HeaderTitleText
} from "./styles";

export const Payment = () => {
    const navigation = useNavigation();
    const [loadingValid, setLoadingValid] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    return (
        <MainContainer>
            <ScreenHeader>
                <BackButtonPill onPress={() => navigation.goBack()}>
                    <Feather name="chevron-left" size={24} color="#e85d22" />
                </BackButtonPill>
                <HeaderTitleText>Pagamento</HeaderTitleText>
            </ScreenHeader>
            <Container>
                <Content>
                    <AddressCard />
                    <ShrimpCard />
                </Content>
                <ContentResume>
                    <ResumeCrad
                        loading={loadingValid}
                        actionLoading={setLoadingValid}
                    />
                    <PaymentButton loading={loadingValid} />
                </ContentResume>
            </Container>
        </MainContainer>
    );
};
