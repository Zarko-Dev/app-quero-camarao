import { Text, View } from "react-native";

import { formatUnreadBadge } from "../../utils/formatUnreadBadge";

export const UnreadBadge = ({ count, size = 18, style }) => {
    const label = formatUnreadBadge(count);

    if (!label) return null;

    return (
        <View
            style={[
                {
                    minWidth: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: "#e53935",
                    paddingHorizontal: size / 4,
                    alignItems: "center",
                    justifyContent: "center",
                },
                style,
            ]}
        >
            <Text style={{ color: "#fff", fontSize: size * 0.6, fontWeight: "700" }}>
                {label}
            </Text>
        </View>
    );
};
