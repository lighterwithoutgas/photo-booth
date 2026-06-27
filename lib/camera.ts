export type CameraErrorCode = "unsupported" | "insecure" | "denied" | "unavailable" | "busy" | "unknown";

export const NEXT_POSE_DELAY_MS = 1_000;

export function cameraReadiness(): CameraErrorCode | null {
  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) return "unsupported";
  if (!window.isSecureContext && location.hostname !== "localhost") return "insecure";
  return null;
}

export function mapCameraError(error: unknown): CameraErrorCode {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "unavailable";
  if (name === "NotReadableError" || name === "AbortError") return "busy";
  return "unknown";
}

export async function requestCamera(deviceId?: string): Promise<MediaStream> {
  const readiness = cameraReadiness();
  if (readiness) throw new DOMException(readiness, readiness);
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: deviceId
      ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 960 } }
      : { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
  });
}

export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}
