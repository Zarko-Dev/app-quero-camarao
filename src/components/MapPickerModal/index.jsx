import { Modal, Platform, Text } from "react-native";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import styled from "styled-components/native";

const Backdrop = styled.Pressable`
    flex: 1;
    background-color: rgba(0, 0, 0, 0.45);
    justify-content: flex-end;
`;

const Sheet = styled.Pressable`
    background-color: #fff;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    padding: 12px 20px 28px;
`;

const Handle = styled.View`
    align-self: center;
    width: 40px;
    height: 4px;
    border-radius: 2px;
    background-color: #d6dde3;
    margin-bottom: 14px;
`;

const Title = styled(Text)`
    font-size: 18px;
    font-weight: 700;
    color: #36536e;
`;

const Subtitle = styled(Text)`
    font-size: 13px;
    color: #64788a;
    margin: 2px 0 16px;
`;

const AppRow = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    gap: 14px;
    padding: 12px;
    border-radius: 14px;
    background-color: #f4f7f9;
    margin-bottom: 10px;
`;

const IconBox = styled.View`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    align-items: center;
    justify-content: center;
    background-color: ${({ color }) => color};
`;

const AppLabel = styled(Text)`
    flex: 1;
    font-size: 16px;
    font-weight: 600;
    color: #36536e;
`;

const CancelButton = styled.TouchableOpacity`
    height: 48px;
    align-items: center;
    justify-content: center;
    margin-top: 4px;
`;

const CancelText = styled(Text)`
    font-size: 16px;
    font-weight: 600;
    color: #64788a;
`;

// iOS abre o Apple Maps (scheme maps:), Android o app de mapas padrão (geo:).
const mapsLabel = Platform.OS === "ios" ? "Apple Maps" : "Google Maps";

export const MapPickerModal = ({ visible, onClose, onSelectMaps, onSelectWaze }) => {
    const choose = (action) => {
        onClose();
        action();
    };

    return (
        <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
            <Backdrop onPress={onClose}>
                <Sheet>
                    <Handle />
                    <Title>Abrir localização</Title>
                    <Subtitle>Escolha o aplicativo para ver o caminho</Subtitle>
                    <AppRow activeOpacity={0.7} onPress={() => choose(onSelectMaps)} accessibilityRole="button" accessibilityLabel={`Abrir no ${mapsLabel}`}>
                        <IconBox color="#34a853">
                            <Feather name="map-pin" size={22} color="#fff" />
                        </IconBox>
                        <AppLabel>{mapsLabel}</AppLabel>
                        <Feather name="chevron-right" size={20} color="#64788a" />
                    </AppRow>
                    <AppRow activeOpacity={0.7} onPress={() => choose(onSelectWaze)} accessibilityRole="button" accessibilityLabel="Abrir no Waze">
                        <IconBox color="#33ccff">
                            <FontAwesome5 name="waze" size={22} color="#fff" />
                        </IconBox>
                        <AppLabel>Waze</AppLabel>
                        <Feather name="chevron-right" size={20} color="#64788a" />
                    </AppRow>
                    <CancelButton onPress={onClose} accessibilityRole="button">
                        <CancelText>Cancelar</CancelText>
                    </CancelButton>
                </Sheet>
            </Backdrop>
        </Modal>
    );
};
