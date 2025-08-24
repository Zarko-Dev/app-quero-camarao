import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;

    justify-content: flex-start;
    align-items: center;

    padding: 14px 14px 0 14px;
`;

export const UserSubtitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
`;

export const ContainerDropdowSelects = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const ContentInputSelect = styled.View`
    width: 45%;
`;

export const ContainerCardInfoValue = styled.View`
    width: 100%;

    padding: 14px;
    border-radius: 10px;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};

    background-color: ${({ theme }) => theme.colors.quaternary};

    elevation: 3;
`;

export const ContentYearlyInfo = styled.View`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
`;

export const ContentTextYearlyInfo = styled.View``;

export const TitleYearlyInfo = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: ${({ theme }) => theme.colors.text};
`;

export const SubtitleYearlyInfo = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text};
`;

export const ImageYearlyInfo = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(50)};
    height: ${({ theme }) => theme.size.componentSize(50)};
`;

export const ContentMonthInfo = styled.View`
    justify-content: flex-end;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(3.5)};
`;

export const ContentTextMonthInfo = styled.View`
    justify-content: flex-end;
`;

export const TitleMonthInfo = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: ${({ theme }) => theme.colors.text};
`;

export const SubtitleMonthInfo = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text};
    text-align: right;
`;

export const ContainerValueMonth = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const ContentTextLeft = styled.View``;

export const TitleLastMoth = styled(TitleYearlyInfo)`
    text-align: ${({ align }) => (align ? "right" : "left")};
`;

export const TitleNextMoth = styled(SubtitleYearlyInfo)``;

export const Divider = styled.View`
    width: 1px;
    height: 100%;

    background-color: ${({ theme }) => theme.colors.border};
`;

export const ContenttextRight = styled.View``;

export const TitleTransaction = styled.Text`
    width: 100%;

    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;
