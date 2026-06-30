/* eslint-disable object-curly-newline */

import { Button, Dialog, Portal, Text } from "react-native-paper";

export const DialogComponent = ({
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
    inverterActionsButtons = false,
}) => {
    const primaryButton = (
        <Button key="primary" onPress={actionButton}>
            {textActionButton}
        </Button>
    );

    const secondaryButton = textSecondaryActionButton ? (
        <Button key="secondary" onPress={secondaryActionButton}>
            {textSecondaryActionButton}
        </Button>
    ) : showCancelButton ? (
        <Button key="cancel" onPress={hideDialog}>Cancelar</Button>
    ) : null;

    return (
        <Portal>
            <Dialog
                visible={visible}
                onDismiss={hideDialog}
                dismissable={dismissable}
            >
                <Dialog.Title>{title}</Dialog.Title>
                <Dialog.Content>
                    <Text variant="bodyMedium">{text}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                    {inverterActionsButtons
                        ? [secondaryButton, primaryButton]
                        : [primaryButton, secondaryButton]}
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};
