/* eslint-disable object-curly-newline */

import { Button, Dialog, Portal } from "react-native-paper";

export const DialogSalePonds = ({
    visible,
    hideDialog,
    title,
    textActionButton,
    actionButton,
    textSecondaryActionButton,
    secondaryActionButton,
    dismissable = true,
    showCancelButton = true,
    children,
}) => (
    <Portal>
        <Dialog
            visible={visible}
            onDismiss={hideDialog}
            dismissable={dismissable}
        >
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Content>{children}</Dialog.Content>
            <Dialog.Actions>
                {textSecondaryActionButton ? (
                    <Button onPress={secondaryActionButton}>
                        {textSecondaryActionButton}
                    </Button>
                ) : (
                    showCancelButton && (
                        <Button onPress={hideDialog}>Cancelar</Button>
                    )
                )}
                <Button onPress={actionButton}>{textActionButton}</Button>
            </Dialog.Actions>
        </Dialog>
    </Portal>
);
