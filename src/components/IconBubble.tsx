import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { View } from 'react-native'
import { useTheme } from '@/src/theme/settings'
import type { ColorToken } from '@/src/theme/tokens'

/** Name of an Ionicons glyph. */
export type IconName = keyof typeof Ionicons.glyphMap

interface IconBubbleProps {
  name: IconName
  size?: number
  background?: ColorToken
  color?: ColorToken
}

/** An icon centred in a round tinted background, used in front of cards and list rows. */
export default function IconBubble({
  name,
  size = 40,
  background = 'bgBrandSoft',
  color = 'iconBrand',
}: IconBubbleProps) {
  const { colors } = useTheme()
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors[background],
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={name} size={size * 0.55} color={colors[color]} />
    </View>
  )
}
