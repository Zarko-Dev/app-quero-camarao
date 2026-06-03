/* eslint-disable object-curly-newline */

import { Button, Dialog, Portal, Text } from "react-native-paper";
import { InputNoMask } from "../InputNoMask";

export const DialogInputComponent = ({
    visible,
    hideDialog,
    title,
    text,
    textActionButton,
    actionButton,
    textSecondaryActionButton,
    secondaryActionButton,
    dismissable = true,
    showCancelButton = true,
    inputValue = "",
    actionInputValue = () => {},
}) => (
    <Portal>
        <Dialog
            visible={visible}
            onDismiss={hideDialog}
            dismissable={dismissable}
        >
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Content>
                <Text variant="bodyMedium">{text}</Text>
                <InputNoMask
                    label="Descrição"
                    onChange={actionInputValue}
                    value={inputValue}
                    autoCapitalize="sentences"
                    multiline={3}
                />
            </Dialog.Content>
            <Dialog.Actions>
                {[
                    <Button key="primary" onPress={actionButton}>{textActionButton}</Button>,
                    textSecondaryActionButton
                        ? <Button key="secondary" onPress={secondaryActionButton}>{textSecondaryActionButton}</Button>
                        : showCancelButton
                            ? <Button key="cancel" onPress={hideDialog}>Cancelar</Button>
                            : null,
                ]}
            </Dialog.Actions>
        </Dialog>
    </Portal>
);
