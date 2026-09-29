import styled from "styled-components/native";
import { Text } from "react-native-paper";

export const Container = styled.ScrollView`
    flex: 1;
    padding: 16px;
    background-color: ${({ theme }) => theme.colors.background};
`;

export const TimelineItem = styled.View`
    flex-direction: row;
    margin-bottom: 16px;
`;

export const LeftColumn = styled.View`
    width: 44px;
    align-items: center;
`;

export const WeekBadge = styled.View`
    width: 36px;
    height: 36px;
    border-radius: 18px;
    background-color: ${({ theme }) => theme.colors.primary};
    justify-content: center;
    align-items: center;
`;

export const WeekBadgeText = styled.Text`
    color: #fff;
    font-size: 13px;
    font-weight: bold;
`;

export const VerticalLine = styled.View`
    flex: 1;
    width: 2px;
    background-color: ${({ theme }) => theme.colors.border};
    margin-top: 4px;
`;

export const RightColumn = styled.View`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: 10px;
    padding: 12px;
    elevation: 2;
    shadow-color: #000;
    shadow-offset: 0px 1px;
    shadow-opacity: 0.08;
    shadow-radius: 3px;
    margin-left: 8px;
    margin-bottom: 4px;
`;

export const WeekLabel = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 8px;
`;

export const WeekInput = styled.TextInput`
    background-color: ${({ theme }) => theme.colors.background};
    border-radius: 6px;
    padding: 10px;
    min-height: 72px;
    color: ${({ theme }) => theme.colors.text};
    font-size: 14px;
    text-align-vertical: top;
    margin-bottom: 8px;
`;

export const SaveRow = styled.View`
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
`;

export const SaveButton = styled.TouchableOpacity`
    background-color: ${({ theme, disabled }) =>
        disabled ? theme.colors.border : theme.colors.primary};
    border-radius: 6px;
    padding: 6px 18px;
    min-width: 80px;
    min-height: 32px;
    justify-content: center;
    align-items: center;
`;

export const SaveButtonText = styled.Text`
    color: #fff;
    font-size: 13px;
    font-weight: bold;
`;

export const SavedLabel = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    color: ${({ theme }) => theme.colors.green};
    margin-right: 10px;
`;

export const MicButton = styled.TouchableOpacity`
    width: 36px;
    height: 32px;
    border-radius: 6px;
    background-color: ${({ isRecording, theme }) =>
        isRecording ? theme.colors.red : theme.colors.secondary};
    justify-content: center;
    align-items: center;
    margin-right: 8px;
`;

export const RecordingBar = styled.View`
    flex-direction: row;
    align-items: center;
    background-color: #fff0ee;
    border-radius: 6px;
    padding: 6px 10px;
    margin-bottom: 8px;
`;

export const RecordingDot = styled.View`
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.red};
    margin-right: 8px;
`;

export const RecordingText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: ${({ theme }) => theme.colors.red};
    flex: 1;
`;
