import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(180)};

    justify-content: space-between;

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.quaternary};
`;

export const Header = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 5px;

    border-width: 0.5px;
    border-color: transparent;
    border-bottom-color: #838383;
`;

export const ContentTextOrderNumber = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
`;

export const TitleOrderNumber = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(17)};

    color: ${({ theme }) => theme.colors.black};
`;

export const TextOrderNumber = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const ContentAlertIndicator = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    padding: 3px 10px;
    border-radius: 50px;

    background-color: ${({ color, theme }) => color || theme.colors.white};
`;

export const TextAlert = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    margin-left: ${({ theme }) => theme.size.dimentionsSize(0.5)};

    color: ${({ theme }) => theme.colors.white};
`;

export const Body = styled.View`
    width: 100%;

    flex-direction: row;
`;

export const ContentOrderValue = styled.View`
    width: 33%;

    justify-content: center;
    align-items: center;
`;

export const TitleOrderValue = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;
`;

export const ContentInfoOrderValue = styled.View`
    justify-content: flex-start;
    flex-direction: row;
`;

export const TextMoney = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;

    margin-right: ${({ theme }) => theme.size.dimentionsSize(0.3)};
    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.7)};
`;

export const TextOrderValue = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(23)};
    font-weight: bold;
`;

export const Divider = styled.View`
    width: 0.5px;
    height: ${({ theme }) => theme.size.componentSize(80)};

    background-color: #838383;
`;

export const ContentShrimp = styled.View`
    width: 67%;

    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ count, theme }) => {
        switch (count) {
            case 1:
                return theme.size.dimentionsSize(3.5);

            case 2:
                return theme.size.dimentionsSize(1);

            case 3:
                return theme.size.dimentionsSize(-0.5);

            case 4:
                return theme.size.dimentionsSize(2);

            default:
                return theme.size.dimentionsSize(2);
        }
    }};
`;

export const ContentTextShrimp = styled.View`
    align-items: center;
    flex-direction: row;

    padding: 3px 0;
`;

export const ShrimpIcon = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(24)};
    height: ${({ theme }) => theme.size.componentSize(24)};
`;

export const TextShrimp = styled(Text)`
    font-size: ${({ count, theme }) => {
        switch (count) {
            case 1:
                return theme.size.fontSize(20);

            case 2:
                return theme.size.fontSize(20);

            case 3:
                return theme.size.fontSize(18);

            case 4:
                return theme.size.fontSize(14);

            default:
                return theme.size.fontSize(13);
        }
    }};

    font-weight: bold;
`;

export const Footer = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 5px;

    border-width: 0.5px;
    border-color: transparent;
    border-top-color: #838383;
`;

export const ContentTextpaymentType = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
`;

export const TitlePaymentType = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    margin-left: ${({ theme }) => theme.size.dimentionsSize(0.5)};

    color: ${({ theme }) => theme.colors.black};
`;

export const ContentDateOrder = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
`;

export const TextDateOrder = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const ContainerActionsButton = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const ContentActionsButton = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;
`;

export const DeleteButton = styled.TouchableOpacity`
    width: 48%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.red};

    elevation: 3;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const PaymentPostButton = styled(DeleteButton)`
    background-color: ${({ theme }) => theme.colors.green};
`;

export const PostButton = styled(PaymentPostButton)`
    width: 100%;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;
