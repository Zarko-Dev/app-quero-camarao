import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;

    justify-content: space-between;

    border-radius: 16px;
    border-left-width: 4px;
    border-left-color: ${({ theme }) => theme.colors.primary};

    background-color: #ffffff;

    elevation: 2;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.08;
    shadow-radius: 4px;

    overflow: hidden;
    margin-bottom: 4px;
`;

export const Header = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 12px 14px;

    border-bottom-width: 1px;
    border-bottom-color: #f0f0f0;
`;

export const ContentTextOrderNumber = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
`;

export const TitleOrderNumber = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    color: #999;
`;

export const TextOrderNumber = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;
    color: #555;
`;

export const ContentAlertIndicator = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    padding: 5px 12px;
    border-radius: 20px;

    background-color: ${({ color, theme }) => color || theme.colors.white};
`;

export const TextAlert = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;

    margin-left: ${({ theme }) => theme.size.dimentionsSize(0.5)};

    color: ${({ textColor }) => textColor || "#fff"};
`;

export const Body = styled.View`
    width: 100%;
    flex-direction: row;
    padding: 14px 0;
`;

export const ContentOrderValue = styled.View`
    width: 33%;

    justify-content: center;
    align-items: center;
`;

export const TitleOrderValue = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #999;
    margin-bottom: 4px;
`;

export const ContentInfoOrderValue = styled.View`
    justify-content: flex-start;
    flex-direction: row;
    align-items: flex-end;
`;

export const TextMoney = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};

    margin-right: ${({ theme }) => theme.size.dimentionsSize(0.3)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(0.5)};
`;

export const TextOrderValue = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(24)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.black};
`;

export const Divider = styled.View`
    width: 1px;
    height: 100%;

    background-color: #f0f0f0;
`;

export const ContentShrimp = styled.View`
    width: 67%;

    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    padding: 0 10px;
`;

export const ContentTextShrimp = styled.View`
    align-items: center;
    flex-direction: row;

    padding: 3px 6px;
`;

export const ShrimpIcon = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(22)};
    height: ${({ theme }) => theme.size.componentSize(22)};
`;

export const TextShrimp = styled(Text)`
    font-size: ${({ count, theme }) => {
        switch (count) {
            case 1:
                return theme.size.fontSize(18);

            case 2:
                return theme.size.fontSize(17);

            case 3:
                return theme.size.fontSize(15);

            case 4:
                return theme.size.fontSize(13);

            default:
                return theme.size.fontSize(12);
        }
    }};

    font-weight: bold;
    color: ${({ theme }) => theme.colors.black};
    margin-left: 4px;
`;

export const Footer = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 10px 14px;

    border-top-width: 1px;
    border-top-color: #f0f0f0;
`;

export const ContentTextpaymentType = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
`;

export const TitlePaymentType = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: 600;

    margin-left: ${({ theme }) => theme.size.dimentionsSize(0.5)};

    color: #555;
`;

export const ContentDateOrder = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
`;

export const TextDateOrder = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #999;
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
    gap: 10px;
`;

export const DeleteButton = styled.TouchableOpacity`
    flex: 1;
    height: ${({ theme }) => theme.size.componentSize(44)};

    justify-content: center;
    align-items: center;

    border-radius: 12px;
    border-width: 1px;
    border-color: #ffb3b3;

    background-color: #fff0f0;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const TextButtonDelete = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    color: #c0392b;
`;

export const PaymentPostButton = styled.TouchableOpacity`
    flex: 1;
    height: ${({ theme }) => theme.size.componentSize(44)};

    justify-content: center;
    align-items: center;

    border-radius: 12px;

    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 2;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.12;
    shadow-radius: 3px;
`;

export const PostButton = styled(PaymentPostButton)`
    width: 100%;
    flex: none;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;
