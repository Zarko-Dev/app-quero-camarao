import { Image, Text, TextInput } from "react-native";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: #f4f8fb;
`;

export const Header = styled.View`
    padding: 12px 16px 10px;
    background-color: #fff;
    border-bottom-width: 1px;
    border-bottom-color: #e8eef4;
    flex-direction: row;
    align-items: center;
    elevation: 2;
    shadow-color: #000;
    shadow-opacity: 0.06;
    shadow-radius: 4px;
`;

export const HeaderInfo = styled.View`
    flex: 1;
    margin-left: 12px;
`;

export const HeaderTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: 700;
    color: #1e3a4f;
`;

export const HeaderSubtitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    color: #64788a;
    margin-top: 2px;
    line-height: 16px;
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

export const ImageBubble = styled(Image)`
    width: 220px;
    height: 165px;
    border-radius: 10px;
`;

export const AudioBubble = styled.View`
    flex-direction: row;
    align-items: center;
    min-width: 160px;
`;

export const AudioPlayButton = styled.TouchableOpacity`
    width: 36px;
    height: 36px;
    border-radius: 18px;
    background-color: rgba(255, 255, 255, 0.2);
    align-items: center;
    justify-content: center;
    margin-right: 8px;
`;

export const AudioWave = styled.View`
    flex: 1;
    height: 2px;
    background-color: ${({ isMine }) => (isMine ? "rgba(255,255,255,0.5)" : "#c8d8e4")};
    border-radius: 1px;
    margin-right: 8px;
`;

export const AudioDuration = styled(Text)`
    color: ${({ isMine }) => (isMine ? "rgba(255,255,255,0.85)" : "#64788a")};
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    min-width: 32px;
    text-align: right;
`;

export const InputRow = styled.View`
    flex-direction: row;
    align-items: flex-end;
    padding: 10px 12px;
    background-color: #fff;
    border-top-width: 1px;
    border-top-color: #e8eef4;
    gap: 8px;
`;

export const AttachButton = styled.TouchableOpacity`
    width: 36px;
    height: 42px;
    align-items: center;
    justify-content: center;
`;

export const ChatInput = styled(TextInput)`
    flex: 1;
    background-color: #f0f5fb;
    border-radius: 20px;
    padding: 10px 16px;
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    color: #36536e;
    max-height: 100px;
`;

export const SendButton = styled.TouchableOpacity`
    background-color: #f55b1f;
    border-radius: 20px;
    width: 42px;
    height: 42px;
    align-items: center;
    justify-content: center;
`;

export const RecordButton = styled.TouchableOpacity`
    background-color: ${({ isRecording }) => (isRecording ? "#e53935" : "#f55b1f")};
    border-radius: 20px;
    width: 42px;
    height: 42px;
    align-items: center;
    justify-content: center;
`;

export const RecordingIndicator = styled.View`
    flex-direction: row;
    align-items: center;
    padding: 6px 16px;
    background-color: #fff3f0;
    border-top-width: 1px;
    border-top-color: #ffd5c8;
`;

export const RecordingText = styled(Text)`
    color: #e53935;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: 600;
`;

export const FullscreenModal = styled.View`
    flex: 1;
    background-color: rgba(0, 0, 0, 0.95);
    align-items: center;
    justify-content: center;
`;

export const FullscreenClose = styled.TouchableOpacity`
    position: absolute;
    top: 52px;
    right: 20px;
    z-index: 10;
    width: 36px;
    height: 36px;
    border-radius: 18px;
    background-color: rgba(255, 255, 255, 0.15);
    align-items: center;
    justify-content: center;
`;
