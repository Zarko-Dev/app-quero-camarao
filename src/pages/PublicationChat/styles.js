import { Text, TextInput } from "react-native";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: #f4f8fb;
`;

export const Header = styled.View`
    padding: 14px 16px;
    background-color: #fff;
    border-bottom-width: 1px;
    border-bottom-color: #e8eef4;
    flex-direction: row;
    align-items: center;
`;

export const HeaderTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: 700;
    color: #36536e;
    flex: 1;
    margin-left: 12px;
`;

export const BubbleWrap = styled.View`
    margin-bottom: 8px;
    align-items: ${({ isMine }) => (isMine ? "flex-end" : "flex-start")};
`;

export const Bubble = styled.View`
    background-color: ${({ isMine }) => (isMine ? "#f55b1f" : "#fff")};
    border-radius: 14px;
    border-bottom-right-radius: ${({ isMine }) => (isMine ? "2px" : "14px")};
    border-bottom-left-radius: ${({ isMine }) => (isMine ? "14px" : "2px")};
    padding: 10px 14px;
    max-width: 75%;
    elevation: 1;
    shadow-color: #000;
    shadow-opacity: 0.05;
    shadow-radius: 3px;
`;

export const BubbleText = styled(Text)`
    color: ${({ isMine }) => (isMine ? "#fff" : "#36536e")};
    font-size: ${({ theme }) => theme.size.fontSize(13)};
`;

export const BubbleTime = styled(Text)`
    color: ${({ isMine }) => (isMine ? "rgba(255,255,255,0.7)" : "#8fa3b2")};
    font-size: ${({ theme }) => theme.size.fontSize(9)};
    margin-top: 2px;
    text-align: right;
`;

export const InputRow = styled.View`
    flex-direction: row;
    align-items: flex-end;
    padding: 10px 12px;
    background-color: #fff;
    border-top-width: 1px;
    border-top-color: #e8eef4;
`;

export const ChatInput = styled(TextInput)`
    flex: 1;
    background-color: #f0f5fb;
    border-radius: 20px;
    padding: 10px 16px;
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    color: #36536e;
    max-height: 100px;
    margin-right: 8px;
`;

export const SendButton = styled.TouchableOpacity`
    background-color: #f55b1f;
    border-radius: 20px;
    width: 42px;
    height: 42px;
    align-items: center;
    justify-content: center;
`;
