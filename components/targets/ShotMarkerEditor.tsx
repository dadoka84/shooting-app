import React, { useCallback, useRef, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { DraftShot } from '@/lib/types';
import { newId } from '@/lib/id';
import { ringValueForPoint } from '@/lib/scoring/mockBakerScore';

type Props = {
  imageUri: string;
  shots: DraftShot[];
  onChange: (shots: DraftShot[]) => void;
};

const MARKER_SIZE = 44;

export function ShotMarkerEditor({ imageUri, shots, onChange }: Props) {
  const [layout, setLayout] = useState({ width: 1, height: 1 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const shotsRef = useRef(shots);
  shotsRef.current = shots;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ width, height });
  };

  const handleBackgroundPress = (evt: { nativeEvent: { locationX: number; locationY: number } }) => {
    const { locationX, locationY } = evt.nativeEvent;
    const x_norm = clamp01(locationX / layout.width);
    const y_norm = clamp01(locationY / layout.height);

    if (selectedId) {
      onChange(shots.filter((s) => s.id !== selectedId));
      setSelectedId(null);
      return;
    }

    const next: DraftShot = {
      id: newId(),
      x_norm,
      y_norm,
      source: 'manual',
    };
    onChange([...shots, next]);
    setSelectedId(next.id);
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Pressable style={styles.imagePressable} onPress={handleBackgroundPress}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      </Pressable>
      {shots.map((shot, index) => (
        <DraggableMarker
          key={shot.id}
          shot={shot}
          index={index}
          layout={layout}
          selected={selectedId === shot.id}
          onSelect={() => setSelectedId(shot.id)}
          onMove={(x_norm, y_norm) => {
            onChange(
              shotsRef.current.map((s) =>
                s.id === shot.id ? { ...s, x_norm, y_norm } : s,
              ),
            );
          }}
        />
      ))}
      <Text style={styles.hint}>
        Tap empty area to add · Tap selected marker to remove · Drag to move
      </Text>
    </View>
  );
}

function DraggableMarker({
  shot,
  index,
  layout,
  selected,
  onSelect,
  onMove,
}: {
  shot: DraftShot;
  index: number;
  layout: { width: number; height: number };
  selected: boolean;
  onSelect: () => void;
  onMove: (x_norm: number, y_norm: number) => void;
}) {
  const startNorm = useRef({ x: shot.x_norm, y: shot.y_norm });

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        onSelect();
        startNorm.current = { x: shot.x_norm, y: shot.y_norm };
      },
      onPanResponderMove: (_evt, gesture) => {
        const xPx = startNorm.current.x * layout.width + gesture.dx;
        const yPx = startNorm.current.y * layout.height + gesture.dy;
        onMove(clamp01(xPx / layout.width), clamp01(yPx / layout.height));
      },
      onPanResponderRelease: (_evt, gesture) => {
        const xPx = startNorm.current.x * layout.width + gesture.dx;
        const yPx = startNorm.current.y * layout.height + gesture.dy;
        onMove(clamp01(xPx / layout.width), clamp01(yPx / layout.height));
      },
    }),
  ).current;

  const left = shot.x_norm * layout.width - MARKER_SIZE / 2;
  const top = shot.y_norm * layout.height - MARKER_SIZE / 2;
  const ring = ringValueForPoint(shot.x_norm, shot.y_norm);

  return (
    <View
      {...pan.panHandlers}
      style={[
        styles.marker,
        {
          left,
          top,
          borderColor: selected ? '#f97316' : '#22c55e',
        },
      ]}
    >
      <Text style={styles.markerText}>{index + 1}</Text>
      <Text style={styles.ringText}>{ring}</Text>
    </View>
  );
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#111',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePressable: {
    ...StyleSheet.absoluteFill,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  marker: {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  ringText: {
    color: '#cbd5e1',
    fontSize: 10,
  },
  hint: {
    position: 'absolute',
    bottom: 4,
    left: 8,
    right: 8,
    color: '#e2e8f0',
    fontSize: 11,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 4,
    borderRadius: 4,
  },
});
