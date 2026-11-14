import type { DriveFileItem } from '../types/deco';

export interface DriveFilePayload {
  id: string;
  name: string;
  mimeType: string;
  textContent?: string;
  base64Data?: string;
}

export async function listDriveFolderFiles(
  folderId: string,
  accessToken: string,
): Promise<{ folderName: string; files: DriveFileItem[] }> {
  const folderRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
      folderId,
    )}?fields=id,name,mimeType&supportsAllDrives=true`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!folderRes.ok) {
    const errBody = await folderRes.json().catch(() => ({}));
    const message =
      errBody?.error?.message ||
      `Unable to open Google Drive folder (${folderRes.status}). Check folder sharing permissions or sign in with the account that has access.`;
    throw new Error(message);
  }

  const folderMeta = (await folderRes.json()) as { id: string; name: string };

  const query = encodeURIComponent(
    `'${folderId}' in parents and trashed = false`,
  );
  const filesRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)&pageSize=50&orderBy=name&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!filesRes.ok) {
    const errBody = await filesRes.json().catch(() => ({}));
    throw new Error(
      errBody?.error?.message ||
        `Failed to list files in folder (${filesRes.status}).`,
    );
  }

  const data = (await filesRes.json()) as { files?: DriveFileItem[] };
  return {
    folderName: folderMeta.name || 'DECO Study Folder',
    files: data.files ?? [],
  };
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export async function fetchDriveFileContent(
  file: DriveFileItem,
  accessToken: string,
): Promise<DriveFilePayload> {
  const headers = { Authorization: `Bearer ${accessToken}` };

  // Google Docs, Slides, Sheets -> export as plain text / csv
  if (file.mimeType === 'application/vnd.google-apps.document') {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        file.id,
      )}/export?mimeType=text/plain`,
      { headers },
    );
    if (!res.ok) {
      throw new Error(`Failed to export Google Doc "${file.name}".`);
    }
    return {
      id: file.id,
      name: file.name,
      mimeType: 'text/plain',
      textContent: await res.text(),
    };
  }

  if (file.mimeType === 'application/vnd.google-apps.presentation') {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        file.id,
      )}/export?mimeType=text/plain`,
      { headers },
    );
    if (!res.ok) {
      throw new Error(`Failed to export Google Slides "${file.name}".`);
    }
    return {
      id: file.id,
      name: file.name,
      mimeType: 'text/plain',
      textContent: await res.text(),
    };
  }

  if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        file.id,
      )}/export?mimeType=text/csv`,
      { headers },
    );
    if (!res.ok) {
      throw new Error(`Failed to export Google Sheet "${file.name}".`);
    }
    return {
      id: file.id,
      name: file.name,
      mimeType: 'text/csv',
      textContent: await res.text(),
    };
  }

  // Plain text / markdown / json
  if (
    file.mimeType.startsWith('text/') ||
    file.name.endsWith('.txt') ||
    file.name.endsWith('.md')
  ) {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        file.id,
      )}?alt=media&supportsAllDrives=true`,
      { headers },
    );
    if (!res.ok) {
      throw new Error(`Failed to download "${file.name}".`);
    }
    return {
      id: file.id,
      name: file.name,
      mimeType: 'text/plain',
      textContent: await res.text(),
    };
  }

  // PDFs and images (supported natively as multimodal inlineData by Gemini)
  if (
    file.mimeType === 'application/pdf' ||
    file.mimeType.startsWith('image/')
  ) {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
        file.id,
      )}?alt=media&supportsAllDrives=true`,
      { headers },
    );
    if (!res.ok) {
      throw new Error(`Failed to download "${file.name}".`);
    }
    const buffer = await res.arrayBuffer();
    if (buffer.byteLength > 12 * 1024 * 1024) {
      throw new Error(
        `"${file.name}" exceeds 12 MB limit for direct study synthesis.`,
      );
    }
    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      base64Data: arrayBufferToBase64(buffer),
    };
  }

  throw new Error(
    `"${file.name}" (${file.mimeType}) is not a supported text, Google Doc/Slide, PDF, or image file.`,
  );
}
