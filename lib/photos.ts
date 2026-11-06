import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';

const TARGETS_DIR = 'targets';

export function targetsDirectory(): string {
  return `${FileSystem.documentDirectory}${TARGETS_DIR}/`;
}

export async function ensureTargetsDirectory(): Promise<string> {
  const dir = targetsDirectory();
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}

export async function persistTargetPhoto(sourceUri: string, targetId: string): Promise<string> {
  const dir = await ensureTargetsDirectory();
  const relative = `${TARGETS_DIR}/${targetId}.jpg`;
  const dest = `${FileSystem.documentDirectory}${relative}`;

  const manipulated = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: 2048 } }],
    { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG },
  );

  await FileSystem.copyAsync({ from: manipulated.uri, to: dest });
  return relative;
}

export function resolvePhotoUri(relativeOrAbsolute: string): string {
  if (relativeOrAbsolute.startsWith('file://') || relativeOrAbsolute.startsWith('http')) {
    return relativeOrAbsolute;
  }
  return `${FileSystem.documentDirectory}${relativeOrAbsolute}`;
}
