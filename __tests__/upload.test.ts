import { NextRequest } from 'next/server';
import { POST } from '@/app/api/upload/route';
import { GET } from '@/app/api/uploads/[...path]/route';
import { existsSync, unlinkSync } from 'fs';
import { UPLOAD_DIR } from '@/lib/upload-utils';
import { join } from 'path';

// Mock authentication
jest.mock('@/lib/auth-utils', () => ({
  JWT_SECRET: 'test-secret'
}));

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: () => ({ value: 'mock-admin-token' })
  })
}));

jest.mock('jsonwebtoken', () => ({
  verify: () => ({ id: 'test-user', email: 'test@example.com', role: 'ADMIN' })
}));

describe('Upload Integration Test', () => {
  const testFileName = 'test-upload-image.png';
  const testFilePath = join(UPLOAD_DIR, testFileName);

  // Clean up test files after each test
  afterEach(() => {
    if (existsSync(testFilePath)) {
      unlinkSync(testFilePath);
    }
  });

  it('should upload a file and serve it back successfully', async () => {
    // Create a mock image file
    const mockImageBuffer = Buffer.from('mock-image-data');
    const mockFile = new File([mockImageBuffer], 'test-image.png', {
      type: 'image/png'
    });

    // Create form data
    const formData = new FormData();
    formData.append('file', mockFile);
    formData.append('context', 'test-casino');
    formData.append('type', 'logo');

    // Create upload request
    const uploadRequest = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });

    // Test upload
    const uploadResponse = await POST(uploadRequest);
    expect(uploadResponse.status).toBe(200);

    const uploadData = await uploadResponse.json();
    expect(uploadData.success).toBe(true);
    expect(uploadData.url).toContain('/uploads/');
    expect(uploadData.fileName).toBeTruthy();

    // Extract filename from the response
    const uploadedFileName = uploadData.fileName;
    const uploadedFilePath = join(UPLOAD_DIR, uploadedFileName);
    
    // Verify file exists on disk
    expect(existsSync(uploadedFilePath)).toBe(true);

    // Test serving the file back
    const serveRequest = new NextRequest(`http://localhost:3000/uploads/${uploadedFileName}`);
    const serveResponse = await GET(serveRequest, { 
      params: { path: [uploadedFileName] } 
    });

    expect(serveResponse.status).toBe(200);
    expect(serveResponse.headers.get('Content-Type')).toBe('image/png');
    expect(serveResponse.headers.get('Cache-Control')).toContain('public');

    // Verify file content
    const responseBuffer = await serveResponse.arrayBuffer();
    expect(responseBuffer.byteLength).toBeGreaterThan(0);

    // Clean up
    if (existsSync(uploadedFilePath)) {
      unlinkSync(uploadedFilePath);
    }
  });

  it('should reject invalid file types', async () => {
    // Create a mock text file
    const mockTextFile = new File(['mock text content'], 'test.txt', {
      type: 'text/plain'
    });

    const formData = new FormData();
    formData.append('file', mockTextFile);

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('Invalid file type');
  });

  it('should reject files that are too large', async () => {
    // Create a mock large file (11MB)
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024, 'a');
    const mockLargeFile = new File([largeBuffer], 'large-image.png', {
      type: 'image/png'
    });

    const formData = new FormData();
    formData.append('file', mockLargeFile);

    const request = new NextRequest('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('File too large');
  });

  it('should return 404 for non-existent files', async () => {
    const request = new NextRequest('http://localhost:3000/uploads/non-existent-file.png');
    const response = await GET(request, { 
      params: { path: ['non-existent-file.png'] } 
    });

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data.error).toBe('File not found');
  });

  it('should prevent directory traversal attacks', async () => {
    const request = new NextRequest('http://localhost:3000/uploads/../../../etc/passwd');
    const response = await GET(request, { 
      params: { path: ['..', '..', '..', 'etc', 'passwd'] } 
    });

    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data.error).toBe('Access denied');
  });
}); 