/**
 * Cross-Platform Bluetooth Service
 * Abstracts Web Bluetooth and Capacitor Bluetooth LE for iOS/Android support
 */

import { Capacitor } from '@capacitor/core';
import { BleClient } from '@capacitor-community/bluetooth-le';

// BLE Service and Characteristic UUIDs for Cyan M02S
// Multiple potential UUIDs based on different firmware versions
export const PRIMARY_SERVICE_UUID = '7905fff0-b5ce-4e99-a40f-4b1e122d00d0';
export const SECONDARY_SERVICE_UUID = '6e40fff0-b5a3-f393-e0a9-e50e24dcca9e';
export const WRITE_CHARACTERISTIC_UUID = '7905fff1-b5ce-4e99-a40f-4b1e122d00d0';
export const NOTIFY_CHARACTERISTIC_UUID = '7905fff2-b5ce-4e99-a40f-4b1e122d00d0';

// Alternative UUIDs that some Cyan devices might use
export const ALT_SERVICE_UUIDS = [
  '7905fff0-b5ce-4e99-a40f-4b1e122d00d0',
  '6e40fff0-b5a3-f393-e0a9-e50e24dcca9e',
  '0000fff0-0000-1000-8000-00805f9b34fb',
  '0000ffe0-0000-1000-8000-00805f9b34fb',
];

// Common BLE services for discovery
export const COMMON_SERVICES = [
  'generic_access',
  'generic_attribute', 
  'device_information',
  'battery_service',
];

export interface BluetoothDeviceInfo {
  id: string;
  name: string | undefined;
}

export interface DiscoveredService {
  uuid: string;
  characteristics: DiscoveredCharacteristic[];
}

export interface DiscoveredCharacteristic {
  uuid: string;
  properties: string[];
}

export type DisconnectCallback = () => void;
export type NotificationCallback = (data: DataView) => void;

class BluetoothService {
  private platform: 'native' | 'web';
  private webDevice: BluetoothDevice | null = null;
  private webServer: BluetoothRemoteGATTServer | null = null;
  private nativeDeviceId: string | null = null;
  private disconnectCallback: DisconnectCallback | null = null;
  private notificationCallback: NotificationCallback | null = null;
  private initialized = false;
  
  // Store discovered service info
  private discoveredServices: DiscoveredService[] = [];
  private activeServiceUUID: string | null = null;
  private activeWriteCharUUID: string | null = null;
  private activeNotifyCharUUID: string | null = null;

  constructor() {
    this.platform = Capacitor.isNativePlatform() ? 'native' : 'web';
  }

  /**
   * Check if Bluetooth is supported on current platform
   */
  isSupported(): boolean {
    if (this.platform === 'native') {
      return true; // Native always supports via Capacitor plugin
    }
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  /**
   * Get current platform
   */
  getPlatform(): 'native' | 'web' {
    return this.platform;
  }

  /**
   * Initialize Bluetooth (required for native)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (this.platform === 'native') {
      await BleClient.initialize();
    }
    this.initialized = true;
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    if (this.platform === 'native') {
      return this.nativeDeviceId !== null;
    }
    return this.webServer?.connected ?? false;
  }

  /**
   * Get discovered services (for debugging)
   */
  getDiscoveredServices(): DiscoveredService[] {
    return this.discoveredServices;
  }

  /**
   * Debug connect - discovers all services without filtering
   */
  async debugConnect(): Promise<{ device: BluetoothDeviceInfo | null; services: DiscoveredService[] }> {
    await this.initialize();

    if (this.platform !== 'web') {
      throw new Error('Debug connect only available on web platform');
    }

    try {
      // Request device with acceptAllDevices to see everything
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          ...ALT_SERVICE_UUIDS,
          ...COMMON_SERVICES,
        ],
      });

      if (!device) {
        throw new Error('No device selected');
      }

      console.log('=== DEBUG: Device Selected ===');
      console.log('Device ID:', device.id);
      console.log('Device Name:', device.name);

      // Connect to GATT server
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }

      console.log('=== DEBUG: Connected to GATT ===');

      // Discover all services
      const services = await server.getPrimaryServices();
      const discoveredServices: DiscoveredService[] = [];

      console.log(`=== DEBUG: Found ${services.length} Services ===`);

      for (const service of services) {
        console.log(`\nService UUID: ${service.uuid}`);
        
        const chars = await service.getCharacteristics();
        const discoveredChars: DiscoveredCharacteristic[] = [];

        for (const char of chars) {
          const props: string[] = [];
          if (char.properties.read) props.push('read');
          if (char.properties.write) props.push('write');
          if (char.properties.writeWithoutResponse) props.push('writeWithoutResponse');
          if (char.properties.notify) props.push('notify');
          if (char.properties.indicate) props.push('indicate');

          console.log(`  Characteristic: ${char.uuid} [${props.join(', ')}]`);
          
          discoveredChars.push({
            uuid: char.uuid,
            properties: props,
          });
        }

        discoveredServices.push({
          uuid: service.uuid,
          characteristics: discoveredChars,
        });
      }

      // Disconnect after discovery
      server.disconnect();

      return {
        device: {
          id: device.id,
          name: device.name,
        },
        services: discoveredServices,
      };
    } catch (error) {
      console.error('Debug connect error:', error);
      throw error;
    }
  }

  /**
   * Request and connect to Cyan glasses
   */
  async connect(onDisconnect?: DisconnectCallback): Promise<BluetoothDeviceInfo | null> {
    await this.initialize();
    this.disconnectCallback = onDisconnect || null;

    try {
      if (this.platform === 'native') {
        return await this.connectNative();
      } else {
        return await this.connectWeb();
      }
    } catch (error) {
      console.error('Bluetooth connect error:', error);
      throw error;
    }
  }

  private async connectNative(): Promise<BluetoothDeviceInfo | null> {
    // Request device with name prefix only
    const device = await BleClient.requestDevice({
      namePrefix: 'Cyan',
      optionalServices: ALT_SERVICE_UUIDS,
    });

    if (!device) {
      throw new Error('No device selected');
    }

    this.nativeDeviceId = device.deviceId;

    // Connect to device
    await BleClient.connect(device.deviceId, (deviceId) => {
      if (deviceId === this.nativeDeviceId) {
        this.handleDisconnect();
      }
    });

    return {
      id: device.deviceId,
      name: device.name,
    };
  }

  private async connectWeb(): Promise<BluetoothDeviceInfo | null> {
    // Web Bluetooth request - use name prefix filters ONLY
    // Don't require services in filters since they may not be advertised
    this.webDevice = await navigator.bluetooth.requestDevice({
      filters: [
        { namePrefix: 'Cyan' },
        { namePrefix: 'M02' },
        { namePrefix: 'HeyCyan' },
        { namePrefix: 'cyan' },
      ],
      optionalServices: [
        ...ALT_SERVICE_UUIDS,
        ...COMMON_SERVICES,
      ],
    });

    if (!this.webDevice) {
      throw new Error('No device selected');
    }

    console.log('Device selected:', this.webDevice.name);

    // Set up disconnect handler
    this.webDevice.addEventListener('gattserverdisconnected', () => {
      this.handleDisconnect();
    });

    // Connect to GATT server
    this.webServer = await this.webDevice.gatt?.connect() || null;
    
    if (!this.webServer) {
      throw new Error('Failed to connect to GATT server');
    }

    console.log('Connected to GATT server');

    // Discover available services dynamically
    await this.discoverServices();

    return {
      id: this.webDevice.id,
      name: this.webDevice.name,
    };
  }

  /**
   * Dynamically discover and catalog available services
   */
  private async discoverServices(): Promise<void> {
    if (!this.webServer) {
      throw new Error('Not connected to GATT server');
    }

    this.discoveredServices = [];
    
    try {
      const services = await this.webServer.getPrimaryServices();
      console.log(`Found ${services.length} services`);

      for (const service of services) {
        console.log(`Service: ${service.uuid}`);
        
        const chars = await service.getCharacteristics();
        const discoveredChars: DiscoveredCharacteristic[] = [];
        
        let hasWrite = false;
        let hasNotify = false;
        let writeCharUUID: string | null = null;
        let notifyCharUUID: string | null = null;

        for (const char of chars) {
          const props: string[] = [];
          if (char.properties.read) props.push('read');
          if (char.properties.write) props.push('write');
          if (char.properties.writeWithoutResponse) props.push('writeWithoutResponse');
          if (char.properties.notify) props.push('notify');
          if (char.properties.indicate) props.push('indicate');

          console.log(`  Char: ${char.uuid} [${props.join(', ')}]`);
          
          discoveredChars.push({
            uuid: char.uuid,
            properties: props,
          });

          // Track write and notify characteristics
          if (char.properties.write || char.properties.writeWithoutResponse) {
            hasWrite = true;
            writeCharUUID = char.uuid;
          }
          if (char.properties.notify) {
            hasNotify = true;
            notifyCharUUID = char.uuid;
          }
        }

        this.discoveredServices.push({
          uuid: service.uuid,
          characteristics: discoveredChars,
        });

        // If this service has both write and notify, use it as the active service
        if (hasWrite && hasNotify && !this.activeServiceUUID) {
          this.activeServiceUUID = service.uuid;
          this.activeWriteCharUUID = writeCharUUID;
          this.activeNotifyCharUUID = notifyCharUUID;
          console.log(`Using service: ${service.uuid}`);
          console.log(`  Write char: ${writeCharUUID}`);
          console.log(`  Notify char: ${notifyCharUUID}`);
        }
      }

      if (!this.activeServiceUUID) {
        console.warn('No suitable service found with write and notify characteristics');
        // List what was found for debugging
        console.log('Available services:', this.discoveredServices.map(s => s.uuid));
      }
    } catch (error) {
      console.error('Service discovery error:', error);
      throw new Error(`Service discovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get primary service - now uses dynamically discovered service
   */
  async getService(): Promise<void> {
    if (this.platform === 'native') {
      return;
    }

    if (!this.webServer) {
      throw new Error('Not connected');
    }

    // Services are already discovered during connect
    if (!this.activeServiceUUID) {
      throw new Error('No compatible service found on device. Please check the debug page for available services.');
    }
  }

  /**
   * Start notifications on notify characteristic
   */
  async startNotifications(callback: NotificationCallback): Promise<void> {
    this.notificationCallback = callback;

    if (this.platform === 'native') {
      if (!this.nativeDeviceId) {
        throw new Error('Not connected');
      }

      // Try each potential service/characteristic combo
      const serviceUUID = this.activeServiceUUID || PRIMARY_SERVICE_UUID;
      const notifyUUID = this.activeNotifyCharUUID || NOTIFY_CHARACTERISTIC_UUID;

      await BleClient.startNotifications(
        this.nativeDeviceId,
        serviceUUID,
        notifyUUID,
        (value) => {
          if (this.notificationCallback) {
            this.notificationCallback(value);
          }
        }
      );
    } else {
      if (!this.webServer || !this.activeServiceUUID || !this.activeNotifyCharUUID) {
        throw new Error('Not connected or no notify characteristic found');
      }

      const service = await this.webServer.getPrimaryService(this.activeServiceUUID);
      const characteristic = await service.getCharacteristic(this.activeNotifyCharUUID);
      
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', (event) => {
        const target = event.target as BluetoothRemoteGATTCharacteristic;
        if (target.value && this.notificationCallback) {
          this.notificationCallback(target.value);
        }
      });
    }
  }

  /**
   * Write data to write characteristic
   */
  async write(data: Uint8Array): Promise<void> {
    if (this.platform === 'native') {
      if (!this.nativeDeviceId) {
        throw new Error('Not connected');
      }

      const serviceUUID = this.activeServiceUUID || PRIMARY_SERVICE_UUID;
      const writeUUID = this.activeWriteCharUUID || WRITE_CHARACTERISTIC_UUID;

      await BleClient.write(
        this.nativeDeviceId,
        serviceUUID,
        writeUUID,
        new DataView(data.buffer)
      );
    } else {
      if (!this.webServer || !this.activeServiceUUID || !this.activeWriteCharUUID) {
        throw new Error('Not connected or no write characteristic found');
      }

      const service = await this.webServer.getPrimaryService(this.activeServiceUUID);
      const characteristic = await service.getCharacteristic(this.activeWriteCharUUID);
      await characteristic.writeValue(data.buffer as ArrayBuffer);
    }
  }

  /**
   * Disconnect from device
   */
  async disconnect(): Promise<void> {
    if (this.platform === 'native') {
      if (this.nativeDeviceId) {
        try {
          await BleClient.disconnect(this.nativeDeviceId);
        } catch (e) {
          // Ignore disconnect errors
        }
        this.nativeDeviceId = null;
      }
    } else {
      if (this.webServer?.connected) {
        this.webServer.disconnect();
      }
      this.webDevice = null;
      this.webServer = null;
    }

    // Reset discovered services
    this.discoveredServices = [];
    this.activeServiceUUID = null;
    this.activeWriteCharUUID = null;
    this.activeNotifyCharUUID = null;
  }

  private handleDisconnect(): void {
    this.nativeDeviceId = null;
    this.webDevice = null;
    this.webServer = null;
    this.discoveredServices = [];
    this.activeServiceUUID = null;
    this.activeWriteCharUUID = null;
    this.activeNotifyCharUUID = null;
    
    if (this.disconnectCallback) {
      this.disconnectCallback();
    }
  }
}

// Export singleton
export const bluetoothService = new BluetoothService();
