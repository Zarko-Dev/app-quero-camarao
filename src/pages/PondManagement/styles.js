import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.background};
`;

export const MessagesList = styled.FlatList`
    flex: 1;
    padding: 12px 16px;
`;

export const MessageBubble = styled.View`
    max-width: 80%;
    padding: 10px 14px;
    border-radius: 16px;
    margin-bottom: 10px;
    align-self: ${({ isUser }) => (isUser ? "flex-end" : "flex-start")};
    background-color: ${({ isUser, theme }) =>
        isUser ? theme.colors.primary : theme.colors.white};
    elevation: 2;
`;

export const MessageText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    color: ${({ isUser, theme }) =>
        isUser ? theme.colors.white : theme.colors.black};
    line-height: 22px;
`;

export const MessageAuthor = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    color: ${({ isUser, theme }) =>
        isUser ? theme.colors.secondary : theme.colors.text};
    margin-bottom: 2px;
    font-weight: bold;
`;

export const BottomBar = styled.View`
    flex-direction: row;
    align-items: center;
    padding: 10px 16px;
    background-color: ${({ theme }) => theme.colors.white};
    border-top-width: 1px;
    border-top-color: ${({ theme }) => theme.colors.border};
    gap: 10px;
`;

export const TextInput = styled.TextInput`
    flex: 1;
    min-height: 44px;
    max-height: 110px;
    padding: 8px 14px;
    border-radius: 22px;
    background-color: ${({ theme }) => theme.colors.background};
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    color: ${({ theme }) => theme.colors.black};
`;

export const SendButton = styled.TouchableOpacity`
    width: 44px;
    height: 44px;
    border-radius: 22px;
    background-color: ${({ theme }) => theme.colors.primary};
    justify-content: center;
    align-items: center;
`;

export const MicButton = styled.TouchableOpacity`
    width: 44px;
    height: 44px;
    border-radius: 22px;
    background-color: ${({ isRecording, theme }) =>
        isRecording ? theme.colors.red : theme.colors.secondary};
    justify-content: center;
    align-items: center;
`;

export const LoadingRow = styled.View`
    flex-direction: row;
    align-items: center;
    align-self: flex-start;
    gap: 8px;
    padding: 8px 14px;
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: 16px;
    margin-bottom: 10px;
    elevation: 2;
`;

export const LoadingText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    color: ${({ theme }) => theme.colors.text};
`;

export const RecordingIndicator = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 6px 0;
    gap: 8px;
`;

export const RecordingDot = styled.View`
    width: 10px;
    height: 10px;
    border-radius: 5px;
    background-color: ${({ theme }) => theme.colors.red};
`;

export const RecordingText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    color: ${({ theme }) => theme.colors.red};
`;
