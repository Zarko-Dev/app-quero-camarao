import { useEffect, useState } from "react";
import {
    Modal, Text, TextInput, TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import styled from "styled-components/native";

const Backdrop = styled.Pressable`
    flex: 1;
    background-color: rgba(0, 0, 0, 0.4);
    align-items: center;
    justify-content: center;
    padding: 24px;
`;

const Card = styled.Pressable`
    width: 100%;
    background-color: #fff;
    border-radius: 16px;
    padding: 20px;
`;

const Title = styled(Text)`
    font-size: 16px;
    font-weight: 700;
    color: #1e3a4f;
    text-align: center;
    margin-bottom: 16px;
`;

const StarsRow = styled.View`
    flex-direction: row;
    justify-content: center;
    gap: 8px;
    margin-bottom: 16px;
`;

const CommentInput = styled(TextInput)`
    border-width: 1px;
    border-color: #e0dbd0;
    border-radius: 10px;
    padding: 10px 12px;
    min-height: 72px;
    font-size: 13px;
    color: #36536e;
    margin-bottom: 16px;
`;

const ButtonsRow = styled.View`
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
`;

const CancelButton = styled.TouchableOpacity`
    padding: 10px 16px;
    border-radius: 8px;
    background-color: #eceae4;
`;

const CancelText = styled(Text)`
    color: #64788a;
    font-weight: 700;
    font-size: 13px;
`;

const SubmitButton = styled.TouchableOpacity`
    padding: 10px 16px;
    border-radius: 8px;
    background-color: #4BB543;
    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

const SubmitText = styled(Text)`
    color: #fff;
    font-weight: 700;
    font-size: 13px;
`;

export const RatingModal = ({
    visible, onClose, targetName, onSubmit,
}) => {
    const [stars, setStars] = useState(0);
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (visible) {
            setStars(0);
            setComment("");
        }
    }, [visible]);

    const handleSubmit = () => {
        if (stars < 1) return;
        onSubmit(stars, comment.trim());
    };

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <Backdrop onPress={onClose}>
                <Card onPress={() => {}}>
                    <Title>{`Avaliar ${targetName}`}</Title>
                    <StarsRow>
                        {[1, 2, 3, 4, 5].map((value) => (
                            <TouchableOpacity
                                key={value}
                                onPress={() => setStars(value)}
                                activeOpacity={0.7}
                            >
                                <Feather
                                    name="star"
                                    size={36}
                                    color={value <= stars ? "#f5a623" : "#d8d2c6"}
                                />
                            </TouchableOpacity>
                        ))}
                    </StarsRow>
                    <CommentInput
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Comentário (opcional)"
                        placeholderTextColor="#b0a898"
                        multiline
                        maxLength={300}
                        textAlignVertical="top"
                    />
                    <ButtonsRow>
                        <CancelButton onPress={onClose} activeOpacity={0.7}>
                            <CancelText>Cancelar</CancelText>
                        </CancelButton>
                        <SubmitButton
                            onPress={handleSubmit}
                            disabled={stars < 1}
                            activeOpacity={0.8}
                        >
                            <SubmitText>Enviar</SubmitText>
                        </SubmitButton>
                    </ButtonsRow>
                </Card>
            </Backdrop>
        </Modal>
    );
};
