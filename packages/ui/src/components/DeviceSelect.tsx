import type { DeviceInfo } from "../lib/api.js";

interface Props {
  devices: DeviceInfo[];
  currentDeviceId: string | null;
  onChange: (deviceId: string | null) => void;
}

export function DeviceSelect({ devices, currentDeviceId, onChange }: Props) {
  if (devices.length === 0) return null;

  return (
    <div className="device-select">
      <label htmlFor="device">Output</label>
      <select
        id="device"
        value={currentDeviceId ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="">Default device</option>
        {devices.map((d) => (
          <option key={d.device_id} value={d.device_id}>
            {d.name}
            {d.is_default ? " (default)" : ""}
          </option>
        ))}
      </select>
    </div>
  );
}
