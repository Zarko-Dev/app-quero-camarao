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
            </Dialog.Content>
            <Dialog.Actions>
                {inverterActionsButtons ? (
                    <>
                        {textSecondaryActionButton ? (
                            <Button onPress={secondaryActionButton}>
                                {textSecondaryActionButton}
                            </Button>
                        ) : (
                            showCancelButton && (
                                <Button onPress={hideDialog}>Cancelar</Button>
                            )
                        )}
                        <Button onPress={actionButton}>
                            {textActionButton}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button onPress={actionButton}>
                            {textActionButton}
                        </Button>
                        {textSecondaryActionButton ? (
                            <Button onPress={secondaryActionButton}>
                                {textSecondaryActionButton}
                            </Button>
                        ) : (
                            showCancelButton && (
                                <Button onPress={hideDialog}>Cancelar</Button>
                            )
                        )}
                    </>
                )}
            </Dialog.Actions>
        </Dialog>
    </Portal>
);
