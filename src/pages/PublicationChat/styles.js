import { Image, Text, TextInput } from "react-native";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: #F1ECE4;
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

export const HeaderRating = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(10)};
    color: #b0a898;
    margin-top: 1px;
`;

export const HeaderTouchable = styled.TouchableOpacity`
    flex: 1;
    flex-direction: row;
    align-items: center;
`;

export const MenuButton = styled.TouchableOpacity`
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
`;

export const Avatar = styled.View`
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: #f55b1f;
    align-items: center;
    justify-content: center;
    margin-left: 10px;
`;

export const AvatarText = styled(Text)`
    color: #fff;
    font-weight: 800;
    font-size: ${({ theme }) => theme.size.fontSize(15)};
`;

export const BubbleWrap = styled.View`
    margin-bottom: 8px;
    align-items: ${({ isMine }) => (isMine ? "flex-end" : "flex-start")};
`;

export const Bubble = styled.View`
    background-color: ${({ isMine }) => (isMine ? "#DCF4D4" : "#fff")};
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
    color: ${({ isMine }) => (isMine ? "#1f3d2b" : "#36536e")};
    font-size: ${({ theme }) => theme.size.fontSize(13)};
`;

export const BubbleTime = styled(Text)`
    color: ${({ isMine }) => (isMine ? "#6b8a70" : "#8fa3b2")};
    font-size: ${({ theme }) => theme.size.fontSize(9)};
    margin-top: 2px;
    text-align: right;
`;

export const BubbleFooter = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 3px;
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
    background-color: rgba(0, 0, 0, 0.06);
    align-items: center;
    justify-content: center;
    margin-right: 8px;
`;

export const AudioWave = styled.View`
    flex: 1;
    height: 2px;
    background-color: ${({ isMine }) => (isMine ? "#a8cbae" : "#c8d8e4")};
    border-radius: 1px;
    margin-right: 8px;
`;

export const AudioDuration = styled(Text)`
    color: ${({ isMine }) => (isMine ? "#6b8a70" : "#64788a")};
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
    background-color: #4BB543;
    border-radius: 20px;
    width: 42px;
    height: 42px;
    align-items: center;
    justify-content: center;
`;

export const RecordButton = styled.TouchableOpacity`
    background-color: ${({ isRecording, isLocked }) => (isLocked ? "#1f6feb" : isRecording ? "#e53935" : "#4BB543")};
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

export const CameraButton = styled.TouchableOpacity`
    width: 36px;
    height: 42px;
    align-items: center;
    justify-content: center;
`;

export const FileRow = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 10px;
    min-width: 180px;
`;

export const FileInfo = styled.View`
    flex: 1;
`;

export const FileName = styled(Text)`
    color: ${({ isMine }) => (isMine ? "#1f3d2b" : "#36536e")};
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: 700;
`;

export const FileSize = styled(Text)`
    color: ${({ isMine }) => (isMine ? "#6b8a70" : "#8fa3b2")};
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    margin-top: 2px;
`;

export const ReplyBar = styled.View`
    flex-direction: row;
    align-items: center;
    background-color: #e9f5e4;
    border-left-width: 3px;
    border-left-color: #4BB543;
    padding: 8px;
`;

export const ReplyBarText = styled(Text)`
    flex: 1;
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    color: #36536e;
`;

export const QuoteBlock = styled.View`
    background-color: rgba(0, 0, 0, 0.05);
    border-left-width: 3px;
    border-left-color: #4BB543;
    border-radius: 6px;
    padding: 6px;
    margin-bottom: 4px;
`;

export const QuoteName = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    font-weight: 700;
    color: #4BB543;
`;

export const QuoteText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    color: #5f7b94;
`;

export const ForwardedLabel = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(10)};
    font-style: italic;
    color: #8fa3b2;
`;

export const DeletedText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-style: italic;
    color: #8fa3b2;
`;
