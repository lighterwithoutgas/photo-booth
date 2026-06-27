const CRC_POLYNOMIAL = 0xedb88320;

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) !== 0 ? CRC_POLYNOMIAL ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function zipDate(date: Date): { time: number; day: number } {
  const year = Math.max(1980, date.getFullYear());
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    day: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

function header(size: number): { bytes: Uint8Array<ArrayBuffer>; view: DataView } {
  const bytes = new Uint8Array(size);
  return { bytes, view: new DataView(bytes.buffer) };
}

function readBlob(blob: Blob): Promise<Uint8Array<ArrayBuffer>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(new Uint8Array(reader.result));
      else reject(new Error("The photo could not be read."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("The photo could not be read."));
    reader.readAsArrayBuffer(blob);
  });
}

export async function createZip(files: readonly File[]): Promise<Blob> {
  const encoder = new TextEncoder();
  const archiveParts: BlobPart[] = [];
  const directoryParts: BlobPart[] = [];
  let offset = 0;
  let directorySize = 0;

  for (const file of files) {
    const name: Uint8Array<ArrayBuffer> = new Uint8Array(encoder.encode(file.name.replaceAll("\\", "_").replaceAll("/", "_")));
    const data = await readBlob(file);
    const checksum = crc32(data);
    const modified = zipDate(new Date(file.lastModified || Date.now()));

    const local = header(30);
    local.view.setUint32(0, 0x04034b50, true);
    local.view.setUint16(4, 20, true);
    local.view.setUint16(10, modified.time, true);
    local.view.setUint16(12, modified.day, true);
    local.view.setUint32(14, checksum, true);
    local.view.setUint32(18, data.byteLength, true);
    local.view.setUint32(22, data.byteLength, true);
    local.view.setUint16(26, name.byteLength, true);
    archiveParts.push(local.bytes, name, data);

    const central = header(46);
    central.view.setUint32(0, 0x02014b50, true);
    central.view.setUint16(4, 20, true);
    central.view.setUint16(6, 20, true);
    central.view.setUint16(12, modified.time, true);
    central.view.setUint16(14, modified.day, true);
    central.view.setUint32(16, checksum, true);
    central.view.setUint32(20, data.byteLength, true);
    central.view.setUint32(24, data.byteLength, true);
    central.view.setUint16(28, name.byteLength, true);
    central.view.setUint32(42, offset, true);
    directoryParts.push(central.bytes, name);

    offset += local.bytes.byteLength + name.byteLength + data.byteLength;
    directorySize += central.bytes.byteLength + name.byteLength;
  }

  const end = header(22);
  end.view.setUint32(0, 0x06054b50, true);
  end.view.setUint16(8, files.length, true);
  end.view.setUint16(10, files.length, true);
  end.view.setUint32(12, directorySize, true);
  end.view.setUint32(16, offset, true);

  return new Blob([...archiveParts, ...directoryParts, end.bytes], { type: "application/zip" });
}
