import { Text } from "react-native-paper";
import styled from "styled-components/native";
import SelectComponent from "../../components/SelectComponent";

export const Container = styled.ScrollView.attrs({
    // Evita o iOS recalcular inset sob o header/abas ao focar campo ou abrir o teclado.
    contentInsetAdjustmentBehavior: "never",
    automaticallyAdjustContentInsets: false,
    keyboardShouldPersistTaps: "handled",
    automaticallyAdjustKeyboardInsets: true,
})`
    flex: 1;
    padding: 0 5px;
    overflow: hidden;
`;

export const Content = styled.View`
    justify-content: flex-start;
    align-items: center;
`;

export const Title = styled(Text)`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};

    font-size: ${({ theme }) => theme.size.fontSize(13)};

    text-align: center;
`;

export const ContentForm = styled.View`
    width: 95%;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const SelectComponentStyle = styled(SelectComponent)`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const ContentUseTerms = styled.View`
    width: 95%;

    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    margin-left: ${({ theme }) => theme.size.dimentionsSize(-2)};
`;

export const ContentZonaRural = styled.View`
   width: 100%;

    background-color: ${({ theme }) => theme.colors.inputColor};

    border-radius: 8px;
    border-width: 1px;
    border-color: #f1967a;

    flex-direction: row;
    align-items: center;

    padding: ${({ theme }) => theme.size.dimentionsSize(1)};

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const UseTermsText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
`;

export const ButtonUseTermsText = styled.TouchableOpacity``;

export const TextButtonUseTerms = styled(UseTermsText)`
    color: ${({ theme }) => theme.colors.primary};
`;

export const ZonaRuralText = styled(UseTermsText)`
    color: #000
`;

export const ButtonRegister = styled.TouchableOpacity`
    width: 85%;
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};

    elevation: 3;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
