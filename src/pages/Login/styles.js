import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: #ffffff;
    align-items: center;
`;

export const ScrollContainer = styled.ScrollView.attrs({
    contentContainerStyle: {
        alignItems: "center",
        paddingBottom: 40,
    }
})`
    width: 100%;
`;

export const Header = styled.View`
    width: 100%;
    align-items: center;
    margin-top: 40px;
    margin-bottom: 24px;
`;

export const BrandCard = styled.View`
    width: 100%;
    align-items: center;
    padding: 20px;
`;

export const LogoImage = styled.Image`
    width: 196px;
    height: 106px;
    margin-bottom: 16px;
`;

export const WelcomeTitle = styled(Text)`
    font-size: 24px;
    color: #1c2b36;
    font-weight: bold;
    text-align: center;
    margin-bottom: 6px;
`;

export const WelcomeSubtitle = styled(Text)`
    font-size: 15px;
    color: #5c6c7b;
    text-align: center;
`;

export const ContentFormLogin = styled.View`
    width: 88%;
    align-items: center;
    padding: 10px 0;
`;

export const ForgotPasswordRow = styled.View`
    width: 100%;
    flex-direction: row;
    justify-content: center;
    margin-top: 16px;
    margin-bottom: 24px;
`;

export const Footer = styled.View`
    width: 88%;
    align-items: center;
`;

export const ButtonLogin = styled.TouchableOpacity`
    width: 100%;
    height: 56px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    background-color: #f55b1f;
    margin-bottom: 16px;
    elevation: 3;
    shadow-color: #f55b1f;
    shadow-offset: 0px 4px;
    shadow-opacity: 0.3;
    shadow-radius: 4px;
`;

export const TextButton = styled(Text)`
    font-size: 18px;
    font-weight: bold;
    color: #ffffff;
    margin-left: 12px;
`;

export const ButtonRegisterBox = styled.TouchableOpacity`
    width: 100%;
    height: 56px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    background-color: #ffffff;
    border-width: 1px;
    border-color: #f55b1f;
`;

export const TextRegister = styled(Text)`
    font-size: 15px;
    color: #5c6c7b;
`;

export const TextButtonRegister = styled(Text)`
    font-size: 15px;
    font-weight: bold;
    color: #f55b1f;
    margin-left: 6px;
`;

export const IconContainerRight = styled.View`
    position: absolute;
    right: 16px;
`;

export const CustomInputWrap = styled.View`
    width: 100%;
    height: 60px;
    flex-direction: row;
    align-items: center;
    border-radius: 12px;
    border-width: 1px;
    border-color: #fbc6a9;
    background-color: #fff9f2;
    margin-bottom: 16px;
    padding: 0 16px;
`;

export const CustomIconBox = styled.View`
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background-color: #ffecd9;
    justify-content: center;
    align-items: center;
    margin-right: 12px;
`;

export const CustomInputText = styled.TextInput`
    flex: 1;
    font-size: 16px;
    color: #333333;
`;

export const BadgesRow = styled.View`
    flex-direction: row;
    justify-content: space-between;
    width: 88%;
    margin-top: 32px;
`;

export const BadgeCol = styled.View`
    flex: 1;
    align-items: center;
`;

export const BadgeText = styled(Text)`
    font-size: 11px;
    color: #5c6c7b;
    text-align: center;
    margin-top: 6px;
`;
