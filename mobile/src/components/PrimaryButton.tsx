import { Pressable, Text } from "react-native"
import { fonts } from "../theme/tokens"

// The web Stage .btn-primary recipe: a flat lamp-tinted pill (no gradient,
// no border). Used by login, register, onboarding and the feed empty states.
// Style must be a plain object: NativeWind's css-interop drops Pressable
// style callback functions (nativewind issue #1105), so no pressed scale.

interface Props {
  label: string
  onPress: () => void
  disabled?: boolean
}

export default function PrimaryButton({ label, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: "rgba(124, 111, 255, 0.15)",
        borderRadius: 999,
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 14, color: "#9d93ff" }}>{label}</Text>
    </Pressable>
  )
}
