import {
    StyleSheet,
    View,
} from "react-native";
import Svg, {
    Defs,
    Path,
    Pattern,
    Rect,
} from "react-native-svg";

const STROKE = "#8a7a5f";
const OPACITY = 0.06;
const WIDTH = 1.5;

export const ChatWallpaper = () => (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
            <Defs>
                <Pattern id="qcWallpaper" width={120} height={120} patternUnits="userSpaceOnUse">
                    {/* camarão: corpo curvo + antenas */}
                    <Path
                        d="M14 34 C10 24 18 14 30 16 C42 18 46 28 40 36 C36 41 28 42 22 39"
                        stroke={STROKE}
                        strokeWidth={WIDTH}
                        fill="none"
                        opacity={OPACITY}
                    />
                    <Path
                        d="M30 16 L36 8 M33 17 L41 11"
                        stroke={STROKE}
                        strokeWidth={WIDTH}
                        fill="none"
                        opacity={OPACITY}
                    />
                    {/* ondas: 3 arcos empilhados */}
                    <Path
                        d="M70 24 Q76 18 82 24 T94 24"
                        stroke={STROKE}
                        strokeWidth={WIDTH}
                        fill="none"
                        opacity={OPACITY}
                    />
                    <Path
                        d="M70 32 Q76 26 82 32 T94 32"
                        stroke={STROKE}
                        strokeWidth={WIDTH}
                        fill="none"
                        opacity={OPACITY}
                    />
                    <Path
                        d="M70 40 Q76 34 82 40 T94 40"
                        stroke={STROKE}
                        strokeWidth={WIDTH}
                        fill="none"
                        opacity={OPACITY}
                    />
                    {/* viveiro: retângulo com linha d'água */}
                    <Rect
                        x={12}
                        y={76}
                        width={36}
                        height={24}
                        rx={4}
                        stroke={STROKE}
                        strokeWidth={WIDTH}
                        fill="none"
                        opacity={OPACITY}
                    />
                    <Path
                        d="M12 86 Q18 82 24 86 T36 86 T48 86"
                        stroke={STROKE}
                        strokeWidth={WIDTH}
                        fill="none"
                        opacity={OPACITY}
                    />
                    {/* balança: travessão + suporte + pratos */}
                    <Path
                        d="M82 74 L82 98 M70 78 L94 78"
                        stroke={STROKE}
                        strokeWidth={WIDTH}
                        fill="none"
                        opacity={OPACITY}
                    />
                    <Path
                        d="M64 88 Q70 94 76 88 M88 88 Q94 94 100 88"
                        stroke={STROKE}
                        strokeWidth={WIDTH}
                        fill="none"
                        opacity={OPACITY}
                    />
                    <Path
                        d="M70 78 L64 88 M76 88 L70 78 M94 78 L88 88 M100 88 L94 78"
                        stroke={STROKE}
                        strokeWidth={WIDTH}
                        fill="none"
                        opacity={OPACITY}
                    />
                </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#qcWallpaper)" />
        </Svg>
    </View>
);
