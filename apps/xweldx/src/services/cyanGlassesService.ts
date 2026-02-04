/**
 * Cyan M02S Smart Glasses BLE Service
 * Cross-platform support via abstraction layer (Web Bluetooth + Capacitor)
 */

import { bluetoothService, BluetoothDeviceInfo } from './bluetoothService';

// Command opcodes
const COMMANDS = {
  CAPTURE_PHOTO: 0x01,
  START_VIDEO: 0x02,
  STOP_VIDEO: 0x03,
  START_AUDIO: 0x04,
  STOP_AUDIO: 0x05,
  GET_BATTERY: 0x10,
  GET_MEDIA_COUNTS: 0x11,
  SYNC_TIME: 0x20,
  GET_FIRMWARE: 0x30,
} as const;

// Response opcodes
const RESPONSES = {
  BATTERY_STATUS: 0x10,
  MEDIA_COUNTS: 0x11,
  PHOTO_CAPTURED: 0x01,
  VIDEO_STARTED: 0x02,
  VIDEO_STOPPED: 0x03,
  AUDIO_STARTED: 0x04,
  AUDIO_STOPPED: 0x05,
  FIRMWARE_INFO: 0x30,
} as const;

export interface CyanGlassesState {
  batteryLevel: number;
  isCharging: boolean;
  isRecordingVideo: boolean;
  isRecordingAudio: boolean;
  photoCount: number;
  videoCount: number;
  audioCount: number;
  firmwareVersion: string;
}

export type CyanGlassesEventType = 
  | 'connected'
  | 'disconnected'
  | 'batteryUpdate'
  | 'mediaCountsUpdate'
  | 'photoCaptured'
  | 'videoStarted'
  | 'videoStopped'
  | 'audioStarted'
  | 'audioStopped'
  | 'error';

export interface CyanGlassesEvent {
  type: CyanGlassesEventType;
  data?: unknown;
}

type EventCallback = (event: CyanGlassesEvent) => void;

class CyanGlassesService {
  private deviceInfo: BluetoothDeviceInfo | null = null;
  private eventListeners: Set<EventCallback> = new Set();
  private keepAliveInterval: ReturnType<typeof setInterval> | null = null;
  
  private state: CyanGlassesState = {
    batteryLevel: 0,
    isCharging: false,
    isRecordingVideo: false,
    isRecordingAudio: false,
    photoCount: 0,
    videoCount: 0,
    audioCount: 0,
    firmwareVersion: 'Unknown',
  };

  /**
   * Check if Bluetooth is available on current platform
   */
  isSupported(): boolean {
    return bluetoothService.isSupported();
  }

  /**
   * Get current platform (native or web)
   */
  getPlatform(): 'native' | 'web' {
    return bluetoothService.getPlatform();
  }

  /**
   * Get current connection state
   */
  isConnected(): boolean {
    return bluetoothService.isConnected();
  }

  /**
   * Get current device state
   */
  getState(): CyanGlassesState {
    return { ...this.state };
  }

  /**
   * Subscribe to device events
   */
  addEventListener(callback: EventCallback): () => void {
    this.eventListeners.add(callback);
    return () => this.eventListeners.delete(callback);
  }

  private emit(event: CyanGlassesEvent): void {
    this.eventListeners.forEach(callback => callback(event));
  }

  /**
   * Connect to Cyan M02S glasses
   */
  async connect(): Promise<boolean> {
    if (!this.isSupported()) {
      this.emit({ type: 'error', data: 'Bluetooth is not supported on this platform/browser' });
      return false;
    }

    try {
      // Connect via abstraction layer
      this.deviceInfo = await bluetoothService.connect(() => {
        this.handleDisconnect();
      });

      if (!this.deviceInfo) {
        throw new Error('No device selected');
      }

      // Get service (for web platform)
      await bluetoothService.getService();

      // Start notifications
      await bluetoothService.startNotifications((data) => {
        this.handleNotification(data);
      });

      // Start keep-alive
      this.startKeepAlive();

      // Initial state sync
      await this.syncTime();
      await this.getBatteryStatus();
      await this.getMediaCounts();
      await this.getFirmwareVersion();

      this.emit({ type: 'connected' });
      return true;
    } catch (error) {
      console.error('Failed to connect to Cyan glasses:', error);
      this.emit({ type: 'error', data: error instanceof Error ? error.message : 'Connection failed' });
      return false;
    }
  }

  /**
   * Disconnect from glasses
   */
  async disconnect(): Promise<void> {
    this.stopKeepAlive();
    await bluetoothService.disconnect();
    this.cleanup();
  }

  private handleDisconnect(): void {
    this.cleanup();
    this.emit({ type: 'disconnected' });
  }

  private cleanup(): void {
    this.stopKeepAlive();
    this.deviceInfo = null;
    this.state = {
      batteryLevel: 0,
      isCharging: false,
      isRecordingVideo: false,
      isRecordingAudio: false,
      photoCount: 0,
      videoCount: 0,
      audioCount: 0,
      firmwareVersion: 'Unknown',
    };
  }

  private startKeepAlive(): void {
    // Send keep-alive every 30 seconds
    this.keepAliveInterval = setInterval(() => {
      this.getBatteryStatus().catch(() => {});
    }, 30000);
  }

  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  /**
   * Handle incoming notifications from the glasses
   */
  private handleNotification(value: DataView): void {
    const data = new Uint8Array(value.buffer);
    const opcode = data[0];

    switch (opcode) {
      case RESPONSES.BATTERY_STATUS:
        this.state.batteryLevel = data[1];
        this.state.isCharging = data[2] === 1;
        this.emit({ type: 'batteryUpdate', data: { batteryLevel: this.state.batteryLevel, isCharging: this.state.isCharging } });
        break;

      case RESPONSES.MEDIA_COUNTS:
        this.state.photoCount = (data[1] << 8) | data[2];
        this.state.videoCount = (data[3] << 8) | data[4];
        this.state.audioCount = (data[5] << 8) | data[6];
        this.emit({ type: 'mediaCountsUpdate', data: { photoCount: this.state.photoCount, videoCount: this.state.videoCount, audioCount: this.state.audioCount } });
        break;

      case RESPONSES.PHOTO_CAPTURED:
        this.state.photoCount++;
        this.emit({ type: 'photoCaptured' });
        break;

      case RESPONSES.VIDEO_STARTED:
        this.state.isRecordingVideo = true;
        this.emit({ type: 'videoStarted' });
        break;

      case RESPONSES.VIDEO_STOPPED:
        this.state.isRecordingVideo = false;
        this.state.videoCount++;
        this.emit({ type: 'videoStopped' });
        break;

      case RESPONSES.AUDIO_STARTED:
        this.state.isRecordingAudio = true;
        this.emit({ type: 'audioStarted' });
        break;

      case RESPONSES.AUDIO_STOPPED:
        this.state.isRecordingAudio = false;
        this.state.audioCount++;
        this.emit({ type: 'audioStopped' });
        break;

      case RESPONSES.FIRMWARE_INFO:
        // Parse firmware version string
        const versionBytes = data.slice(1);
        this.state.firmwareVersion = new TextDecoder().decode(versionBytes).replace(/\0/g, '');
        break;
    }
  }

  /**
   * Send command to glasses
   */
  private async sendCommand(opcode: number, payload: Uint8Array = new Uint8Array()): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('Not connected to glasses');
    }

    // Build command: [opcode, ...payload, checksum]
    const data = new Uint8Array(payload.length + 2);
    data[0] = opcode;
    data.set(payload, 1);
    
    // Simple checksum (XOR of all bytes)
    let checksum = 0;
    for (let i = 0; i < data.length - 1; i++) {
      checksum ^= data[i];
    }
    data[data.length - 1] = checksum;

    await bluetoothService.write(data);
  }

  // Public command methods

  async capturePhoto(): Promise<void> {
    await this.sendCommand(COMMANDS.CAPTURE_PHOTO);
  }

  async startVideoRecording(): Promise<void> {
    await this.sendCommand(COMMANDS.START_VIDEO);
  }

  async stopVideoRecording(): Promise<void> {
    await this.sendCommand(COMMANDS.STOP_VIDEO);
  }

  async startAudioRecording(): Promise<void> {
    await this.sendCommand(COMMANDS.START_AUDIO);
  }

  async stopAudioRecording(): Promise<void> {
    await this.sendCommand(COMMANDS.STOP_AUDIO);
  }

  async getBatteryStatus(): Promise<void> {
    await this.sendCommand(COMMANDS.GET_BATTERY);
  }

  async getMediaCounts(): Promise<void> {
    await this.sendCommand(COMMANDS.GET_MEDIA_COUNTS);
  }

  async getFirmwareVersion(): Promise<void> {
    await this.sendCommand(COMMANDS.GET_FIRMWARE);
  }

  async syncTime(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const payload = new Uint8Array(4);
    payload[0] = (now >> 24) & 0xff;
    payload[1] = (now >> 16) & 0xff;
    payload[2] = (now >> 8) & 0xff;
    payload[3] = now & 0xff;
    await this.sendCommand(COMMANDS.SYNC_TIME, payload);
  }
}

// Export singleton instance
export const cyanGlassesService = new CyanGlassesService();
