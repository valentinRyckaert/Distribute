import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import AppText from '@/src/components/AppText'
import Card from '@/src/components/Card'
import Screen from '@/src/components/Screen'
import ToggleRow from '@/src/components/ToggleRow'
import TopBar from '@/src/components/TopBar'
import { useSettings, useTheme } from '@/src/theme/settings'
import { radius, spacing, TEXT_SCALES, type TextScale } from '@/src/theme/tokens'

const SCALE_LABELS: Record<TextScale, string> = {
  normal: 'Normal',
  large: 'Grand',
  xlarge: 'Très grand',
}

/** Reading comfort: text size, read aloud, high contrast and reduced animations. */
export default function ComfortScreen() {
  const { colors } = useTheme()
  const { settings, updateSettings } = useSettings()

  return (
    <Screen>
      <TopBar listenText="Confort de lecture. Réglez l’application pour qu’elle soit agréable à lire." />
      <View style={styles.heading}>
        <AppText variant="titleLarge" accessibilityRole="header">
          Confort de lecture
        </AppText>
        <AppText variant="bodyLarge" color="textSecondary">
          Réglez l’application pour qu’elle soit agréable à lire.
        </AppText>
      </View>

      <Card>
        <AppText variant="labelLarge">Taille du texte</AppText>
        <View style={styles.scales} accessibilityRole="radiogroup">
          {(Object.keys(TEXT_SCALES) as TextScale[]).map((scale) => {
            const selected = settings.textScale === scale
            return (
              <Pressable
                key={scale}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`Texte ${SCALE_LABELS[scale]}`}
                onPress={() => updateSettings({ textScale: scale })}
                style={[
                  styles.scale,
                  {
                    backgroundColor: selected ? colors.bgBrandSoft : colors.bgSurface,
                    borderColor: selected ? colors.borderFocus : colors.borderDefault,
                    borderWidth: selected ? 2.5 : 1,
                  },
                ]}
              >
                <AppText
                  variant="titleSmall"
                  color={selected ? 'textBrand' : 'textPrimary'}
                  style={{ fontSize: 19 * TEXT_SCALES[scale], lineHeight: 26 * TEXT_SCALES[scale] }}
                >
                  Aa
                </AppText>
                <AppText variant="caption" color={selected ? 'textBrand' : 'textSecondary'}>
                  {SCALE_LABELS[scale]}
                </AppText>
              </Pressable>
            )
          })}
        </View>
        <View style={[styles.preview, { backgroundColor: colors.bgSubtle }]}>
          <AppText variant="bodyLarge">
            Aperçu : débranchez la box Internet pendant 30 secondes.
          </AppText>
        </View>
      </Card>

      <ToggleRow
        label="Lire les fiches à voix haute"
        description="Un bouton « Écouter » apparaît sur chaque fiche."
        value={settings.readAloud}
        onChange={(readAloud) => updateSettings({ readAloud })}
      />
      <ToggleRow
        label="Contraste renforcé"
        description="Textes plus foncés, bordures plus visibles."
        value={settings.highContrast}
        onChange={(highContrast) => updateSettings({ highContrast })}
      />
      <ToggleRow
        label="Réduire les animations"
        value={settings.reduceMotion}
        onChange={(reduceMotion) => updateSettings({ reduceMotion })}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  heading: { gap: spacing.sm },
  scales: { flexDirection: 'row', gap: spacing.md },
  scale: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, borderRadius: radius.md },
  preview: { padding: spacing.lg, borderRadius: radius.md },
})
